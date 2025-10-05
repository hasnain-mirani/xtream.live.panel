// pages/api/auth/reset.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB as dbConnect } from "@/lib/db";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, token, password } = req.body || {};
  if (!email || !token || !password) return res.status(400).json({ error: "Missing fields" });
  if (String(password).length < 8) return res.status(400).json({ error: "Password too short" });

  await dbConnect();

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user?.passwordResetTokenHash || !user.passwordResetExpiresAt) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
  if (user.passwordResetExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: "Token expired" });
  }

  const hash = crypto.createHash("sha256").update(String(token)).digest("hex");
  if (hash !== user.passwordResetTokenHash) {
    return res.status(400).json({ error: "Invalid token" });
  }

  // All good → update password & clear reset fields
  user.passwordHash = await bcrypt.hash(String(password), 10);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  return res.status(200).json({ ok: true });
}
