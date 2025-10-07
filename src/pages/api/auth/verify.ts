import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { EmailToken } from "@/models/EmailToken";
import  User  from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method!=="POST") return res.status(405).end();
  await connectDB();
  const { token, otp, email } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid" });

  const now = new Date();
  const q: any = { userId: String(user._id), kind: "verify", used: false, expiresAt: { $gt: now } };
  if (token) q.token = token;
  if (otp) q.otp = otp;
  const et = await EmailToken.findOne(q);
  if (!et) return res.status(400).json({ message: "Invalid/expired" });

  et.used = true; await et.save();
  user.verified = true; await user.save();
  return res.json({ ok: true, verified: true });
}
