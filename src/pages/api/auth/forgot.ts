import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { emailResetPassword } from "@/server/emailService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    await connectDB();

    const { email = "" } = req.body || {};
    // Always return OK to avoid user enumeration
    const u = await User.findOne({ email }).lean();
    if (!u) return res.status(200).json({ ok: true });

    const raw = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await User.updateOne({ _id: u._id }, {
      $set: { passwordResetTokenHash: hash, passwordResetExpiresAt: expires },
    });

    const resetUrl = `${process.env.APP_URL}/reset?token=${raw}&uid=${u._id}`;
    emailResetPassword(u.email, u.name || "there", resetUrl).catch(console.error);

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("forgot error:", e?.message || e);
    return res.status(500).json({ message: "Server error" });
  }
}
