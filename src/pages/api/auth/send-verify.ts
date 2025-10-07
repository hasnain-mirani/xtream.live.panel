import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import  User  from "@/models/User";
import { EmailToken } from "@/models/EmailToken";
import { randomOtp, randomToken } from "@/lib/token";
import { sendMail } from "@/lib/mailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method!=="POST") return res.status(405).end();
  await connectDB();
  const { email } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.json({ ok: true }); // don't leak

  const token = randomToken(32);
  const otp = randomOtp();
  const expiresAt = new Date(Date.now()+15*60*1000);
  await EmailToken.create({ userId: String(user._id), kind: "verify", token, otp, expiresAt, used: false });

  const link = `${process.env.APP_URL}/auth/verify?token=${token}`;
  await sendMail({
    to: email,
    subject: "Verify your email",
    html: `
      <p>Click to verify: <a href="${link}">${link}</a></p>
      <p>Or enter this OTP: <b>${otp}</b> (valid 15 minutes)</p>
    `
  });
  return res.json({ ok: true });
}
