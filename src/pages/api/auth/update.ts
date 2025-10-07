
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import  User  from "@/models/User";
import { getUserFromReq } from "@/lib/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: "Missing name" });
  await User.findByIdAndUpdate(me.id, { name });
  return res.json({ ok: true });
}
