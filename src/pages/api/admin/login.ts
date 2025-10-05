import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/User";              // ⬅️ default import
import bcrypt from "bcryptjs";
import { signAdminToken } from "@/lib/adminAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectDB();

    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // If you ever set select:false on passwordHash later, add .select("+passwordHash")
    const u = await User.findOne({ email: normalizedEmail }).lean<{
      _id: any; email: string; role?: string; passwordHash?: string;
    }>();

    if (!u || !u.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (u.role !== "admin") {
      return res.status(403).json({ message: "Not an admin account" });
    }

    const token = signAdminToken({ id: String(u._id), email: u.email, role: "admin" });

    res.setHeader(
      "Set-Cookie",
      `admin_token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Admin login error:", err?.message || err);
    return res.status(500).json({ message: "Server error" });
  }
}
