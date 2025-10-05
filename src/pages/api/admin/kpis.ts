import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserFromReq } from "@/lib/jwt";
import  User  from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { Event } from "@/models/Event";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });
  if (me.role !== "admin") return res.status(403).json({ message: "Admin only" });

  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
  const last24h = new Date(now.getTime() - 24*60*60*1000);
  const last7d = new Date(now.getTime() - 7*24*60*60*1000);

  const [signupsToday, trialsActive, watchSessions24h, upgradeIntents7d] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: startOfDay } }),
    Subscription.countDocuments({ status: "trial", trialEndsAt: { $gt: now } }),
    Event.countDocuments({ type: "watch_ping", createdAt: { $gte: last24h } }),
    Event.countDocuments({ type: "upgrade_intent", createdAt: { $gte: last7d } }),
  ]);

  return res.json({ signupsToday, trialsActive, watchSessions24h, upgradeIntents7d });
}
