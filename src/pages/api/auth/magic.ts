import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { EmailToken } from "@/models/EmailToken";
import { User } from "@/models/User";
import { signToken } from "@/lib/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method!=="POST") return res.status(405).end();
  await connectDB();
  const { token } = req.body || {};
  const now = new Date();
  const et = await EmailToken.findOne({ token, kind: "magic", used: false, expiresAt: { $gt: now } });
  if (!et) return res.status(400).json({ message: "Invalid/expired" });

  const user = await User.findById(et.userId);
  if (!user) return res.status(400).json({ message: "Invalid" });

  const jwt = signToken({ id: String(user._id), role: user.role as any });
  res.setHeader("Set-Cookie", `token=${jwt}; HttpOnly; Path=/; SameSite=Lax`);
  et.used = true; await et.save();
  return res.json({ ok: true });
}
