import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromReq } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { Channel } from "@/models/Channel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });

  const sub = await Subscription.findOne({ userId: me.id });
  const now = new Date();
  const allowed = sub && (
    (sub.status === "trial" && sub.trialEndsAt && sub.trialEndsAt.getTime() > now.getTime()) ||
    sub.status === "active"
  );
  if (!allowed) return res.status(403).json({ message: "No active access" });

  const items = await Channel.find({ active: true }).sort({ order: 1, name: 1 }).select("key name").lean();
  return res.json({ channels: items.map(i => ({ id: i.key, name: i.name })) });
}
