import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserFromReq } from "@/lib/jwt";
import { User } from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ⚠️ DEV ONLY — consider guarding with an env allowlist
  if (process.env.NODE_ENV !== "development") return res.status(403).end();

  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });

  const u = await User.findById(me.id);
  if (!u) return res.status(404).json({ message: "User not found" });

  u.role = "admin" as any;
  u.active = true;
  await u.save();

  return res.json({ ok: true, role: u.role });
}
