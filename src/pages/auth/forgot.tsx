// pages/api/auth/forgot.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { connectDB as dbConnect } from "@/lib/db";
import User from "@/models/User";
import { makeTransport } from "@/lib/mailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email required" });

  await dbConnect();
  const user = await User.findOne({ email: String(email).toLowerCase() });
  // Intentionally do NOT reveal if user exists (avoid user enumeration)
  if (!user) return res.status(200).json({ ok: true });

  // Create raw token & store its hash + expiry
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  user.passwordResetTokenHash = hash;
  user.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await user.save();

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${base}/reset?token=${encodeURIComponent(raw)}&email=${encodeURIComponent(user.email)}`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial">
      <h2>Reset your password</h2>
      <p>Click the button below to choose a new password (link valid for 1 hour):</p>
      <p><a href="${link}" style="background:#000;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Reset password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    const t = makeTransport();
    await t.sendMail({
      from: process.env.SMTP_FROM!,
      to: user.email,
      subject: "Reset your password",
      html,
    });
  } catch (e) {
    // Don't leak mail errors to the client—still return ok
  }

  return res.status(200).json({ ok: true });
}
