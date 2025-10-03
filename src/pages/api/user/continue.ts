import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserFromReq } from "@/lib/jwt";
import { WatchProgress } from "@/models/WatchProgress";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });
  const list = await WatchProgress.find({ userId: me.id }).sort({ updatedAt: -1 }).limit(10).lean();
  return res.json({ items: list });
}
