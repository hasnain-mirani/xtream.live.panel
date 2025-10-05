import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db"; import { getUserFromReq } from "@/lib/jwt";
import  Program  from "@/models/Program";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const me = getUserFromReq(req); if (!me) return res.status(401).end();
  if (me.role !== "admin") return res.status(403).end();

  if (req.method === "GET") {
    const { channelKey } = req.query as { channelKey?: string };
    const q: any = {}; if (channelKey) q.channelKey = channelKey;
    const items = await Program.find(q).sort({ start:1 }).limit(200).lean();
    return res.json({ items });
  }
  if (req.method === "POST") {
    const { channelKey, title, start, end } = req.body || {};
    if (!channelKey || !title || !start || !end) return res.status(400).json({ message:"Missing fields" });
    const item = await Program.create({ channelKey, title, start:new Date(start), end:new Date(end) });
    return res.json({ item });
  }
  if (req.method === "DELETE") {
    const { id } = req.query as { id?: string };
    if (!id) return res.status(400).json({ message:"Missing id" });
    await Program.findByIdAndDelete(id); return res.json({ ok:true });
  }
  return res.status(405).end();
}
