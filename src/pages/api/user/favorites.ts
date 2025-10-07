import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserFromReq } from "@/lib/jwt";
import  User  from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });

  if (req.method === "GET") {
    const user = await User.findById(me.id).select("favorites").lean();
    return res.json({ favorites: (user && "favorites" in user ? user.favorites : []) });
  }
  if (req.method === "POST") {
    const { key } = req.body || {};
    if (!key) return res.status(400).json({ message: "Missing key" });
    await User.updateOne({ _id: me.id }, { $addToSet: { favorites: key } });
    return res.json({ ok: true });
  }
  if (req.method === "DELETE") {
    const { key } = req.query as { key?: string };
    if (!key) return res.status(400).json({ message: "Missing key" });
    await User.updateOne({ _id: me.id }, { $pull: { favorites: key } });
    return res.json({ ok: true });
  }
  return res.status(405).end();
}
