import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import  User  from "@/models/User";
import { Subscription } from "@/models/Subscription";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// OPTIONAL helpers (only if you created these models)
async function logAdmin(action: string, targetUserId: string, payload?: any) {
  try {
    const { AdminLog } = await import("@/models/AdminLog");
    await AdminLog.create({ action, targetUserId, payload, adminEmail: null });
  } catch { /* ignore if model not present */ }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    // ---------- LIST (filter: only "user" role) with search + pagination ----------
    if (req.method === "GET") {
      const q = String(req.query.q || "").trim();
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.min(100, Math.max(5, Number(req.query.limit || 20)));

      const filter: any = { role: "user" };
      if (q) filter.$or = [
        { email: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ];

      const total = await User.countDocuments(filter);
      const users = await User.find(filter)
        .select("name email role active verified createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const ids = users.map((u: any) => String(u._id));
      const subs = await Subscription.find({ userId: { $in: ids } })
        .select("userId status trialEndsAt currentPeriodEnd planMonths")
        .lean();
      const subMap = new Map(subs.map((s: any) => [String(s.userId), s]));

      return res.status(200).json({
        page, limit, total,
        users: users.map((u: any) => ({
          id: String(u._id),
          name: u.name || "",
          email: u.email,
          role: u.role || "user",
          active: u.active !== false,
          verified: !!u.verified,
          createdAt: u.createdAt,
          sub: subMap.get(String(u._id)) || null,
        })),
      });
    }

    // ---------- MUTATIONS ----------
    if (req.method === "POST") {
      const { id, action, payload } = req.body || {};
      if (!id || !action) return res.status(400).json({ message: "Missing id/action" });

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Toggle Active
      if (action === "toggleActive") {
        await User.updateOne(
          { _id: user._id },
          [{ $set: { active: { $not: { $ifNull: ["$active", true] } } } }]
        );
        const refreshed = await User.findById(user._id).select("active").lean();
        const activeValue = Array.isArray(refreshed) ? refreshed[0]?.active : refreshed?.active;
        await logAdmin("toggleActive", id, { active: activeValue });
        return res.json({ ok: true, active: !!activeValue });
      }

      // Start Trial (48h)
      if (action === "startTrial") {
        const trialEnds = new Date(Date.now() + 48*60*60*1000);
        await Subscription.updateOne(
          { userId: String(user._id) },
          { $set: { status: "trial", trialEndsAt: trialEnds }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
        await logAdmin("startTrial", id, { trialEnds });
        return res.json({ ok: true, status: "trial", trialEndsAt: trialEnds });
      }

      // Set Subscription (1,3,6,12 months)
      if (action === "setSubscription") {
        const months = Number(payload?.months || 1);
        const now = new Date();
        const end = new Date(now); end.setMonth(end.getMonth() + months);
        await Subscription.updateOne(
          { userId: String(user._id) },
          { $set: { status: "active", currentPeriodEnd: end, planMonths: months }, $setOnInsert: { createdAt: now } },
          { upsert: true }
        );
        await logAdmin("setSubscription", id, { months, currentPeriodEnd: end });
        return res.json({ ok: true, status: "active", currentPeriodEnd: end, planMonths: months });
      }

      // Apply Voucher (requires Voucher model, optional)
      if (action === "applyVoucher") {
        try {
          const { Voucher } = await import("@/models/Voucher");
          const code = String(payload?.code || "").trim().toUpperCase();
          const v = await Voucher.findOne({ code });
          if (!v) return res.status(400).json({ message: "Invalid voucher" });
          if (v.usedBy) return res.status(400).json({ message: "Voucher already used" });

          const months = v.months;
          const now = new Date();
          const end = new Date(now); end.setMonth(end.getMonth() + months);
          await Subscription.updateOne(
            { userId: String(user._id) },
            { $set: { status: "active", currentPeriodEnd: end, planMonths: months }, $setOnInsert: { createdAt: now } },
            { upsert: true }
          );
          v.usedBy = String(user._id); v.usedAt = new Date(); await v.save();
          await logAdmin("applyVoucher", id, { code, months });
          return res.json({ ok: true, months, currentPeriodEnd: end });
        } catch {
          return res.status(500).json({ message: "Voucher model not available" });
        }
      }

      // Set Temporary Password (returns temp; copy on client)
      if (action === "setTempPassword") {
        const temp = payload?.password || Math.random().toString(36).slice(2, 10);
        const hash = await bcrypt.hash(temp, 10);
        await User.updateOne({ _id: user._id }, { $set: { passwordHash: hash } });
        await logAdmin("setTempPassword", id, { tempGenerated: true });
        return res.json({ ok: true, tempPassword: temp });
      }

      // Update user fields (name/email/active/verified)
      if (action === "updateUser") {
        const { name, email, active, verified } = payload || {};
        await User.updateOne(
          { _id: user._id },
          { $set: {
            ...(name !== undefined ? { name } : {}),
            ...(email !== undefined ? { email } : {}),
            ...(active !== undefined ? { active: !!active } : {}),
            ...(verified !== undefined ? { verified: !!verified } : {}),
          } }
        );
        const refreshed = await User.findById(user._id).select("name email active verified").lean();
        await logAdmin("updateUser", id, refreshed);
        return res.json({ ok: true, user: { id, ...refreshed } });
      }

      // Impersonate (set normal user cookie; open dashboard in new tab)
      if (action === "impersonate") {
        const token = jwt.sign(
          { id: String(user._id), role: "user" },
          process.env.JWT_SECRET || "dev-secret",
          { expiresIn: "2h" }
        );
        res.setHeader("Set-Cookie", `token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${2*60*60}`);
        await logAdmin("impersonate", id);
        return res.json({ ok: true });
      }

      // Force logout (delete active sessions; only if you have PlaySession)
      if (action === "forceLogout") {
        try {
          const { PlaySession } = await import("@/models/PlaySession");
          await PlaySession.deleteMany({ userId: String(user._id) });
          await logAdmin("forceLogout", id);
          return res.json({ ok: true });
        } catch {
          return res.json({ ok: true, note: "PlaySession model not available" });
        }
      }

      // Delete user (explicit destructive)
      if (action === "deleteUser") {
        await Subscription.deleteMany({ userId: String(user._id) });
        await User.deleteOne({ _id: user._id });
        await logAdmin("deleteUser", id);
        return res.json({ ok: true, deleted: true });
      }

      return res.status(400).json({ message: "Unknown action" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (e: any) {
    console.error("admin/users error:", e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
}
