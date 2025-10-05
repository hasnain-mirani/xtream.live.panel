import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db"; import { getUserFromReq } from "@/lib/jwt";
import  Channel  from "@/models/Channel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const me = getUserFromReq(req); if (!me) return res.status(401).end();
  if (me.role !== "admin") return res.status(403).end();

  if (req.method === "GET") {
    const items = await Channel.find({}).sort({ order:1, name:1 }).lean();
    return res.json({ items });
  }
  if (req.method === "POST") {
    const { key, name, url, category = "", order = 0, active = true } = req.body || {};
    if (!key || !name || !url) return res.status(400).json({ message: "Missing fields" });
    const item = await Channel.findOneAndUpdate({ key }, { key, name, url, category, order, active }, { upsert: true, new: true });
    return res.json({ item });
  }
  if (req.method === "DELETE") {
    const { key } = req.query as { key?: string };
    if (!key) return res.status(400).json({ message: "Missing key" });
    await Channel.findOneAndDelete({ key }); return res.json({ ok:true });
  }
  return res.status(405).end();
}
