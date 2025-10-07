import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import  Program  from "@/models/Program";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { channelKey } = req.query as { channelKey?: string };
  if (!channelKey) return res.status(400).json({ message: "Missing channelKey" });

  const now = new Date();
  const start = new Date(now); start.setHours(0,0,0,0);
  const end = new Date(now); end.setHours(23,59,59,999);

  const items = await Program.find({ channelKey, start: { $gte: start, $lte: end } }).sort({ start: 1 }).lean();
  return res.json({ items });
}
