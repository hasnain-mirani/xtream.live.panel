import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { EmailToken } from "@/models/EmailToken";
import User  from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method!=="POST") return res.status(405).end();
  await connectDB();
  const { token, password } = req.body || {};
  const now = new Date();
  const et = await EmailToken.findOne({ token, kind: "reset", used: false, expiresAt: { $gt: now } });
  if (!et) return res.status(400).json({ message: "Invalid/expired" });

  const user = await User.findById(et.userId);
  if (!user) return res.status(400).json({ message: "Invalid" });
  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();
  et.used = true; await et.save();
  return res.json({ ok: true });
}
