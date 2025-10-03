import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { EmailToken } from "@/models/EmailToken";
import { randomToken } from "@/lib/token";
import { sendMail } from "@/lib/mailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method!=="POST") return res.status(405).end();
  await connectDB();
  const { email } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.json({ ok: true });

  const token = randomToken(32);
  const expiresAt = new Date(Date.now()+10*60*1000);
  await EmailToken.create({ userId: String(user._id), kind: "magic", token, expiresAt, used: false });
  const link = `${process.env.APP_URL}/auth/magic?token=${token}`;
  await sendMail(email, "Magic Login", `<p>Click to login: <a href="${link}">${link}</a></p>`);
  return res.json({ ok: true });
}
