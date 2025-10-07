import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromReq } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import Channel from "@/models/Channel";
import { PlaySession } from "@/models/PlaySession";
import { randomUUID } from "crypto";

const MAX_SESSIONS = 2;
const SESSION_TTL_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });

  const { id } = req.query as { id?: string };
  const sub = await Subscription.findOne({ userId: me.id });
  const now = new Date();
  const allowed = sub && (
    (sub.status === "trial" && sub.trialEndsAt && sub.trialEndsAt.getTime() > now.getTime()) ||
    sub.status === "active"
  );
  if (!allowed) return res.status(403).json({ message: "No active access" });

  const ch = await Channel.findOne({ key: id, active: true }).lean();
  if (!ch || Array.isArray(ch) || !('url' in ch)) return res.status(404).json({ message: "Channel not found" });

  // device guard
  await PlaySession.deleteMany({ userId: me.id, lastPingAt: { $lt: new Date(Date.now() - SESSION_TTL_MS) } });
  const activeCount = await PlaySession.countDocuments({ userId: me.id });
  if (activeCount >= MAX_SESSIONS) return res.status(429).json({ message: "Too many active sessions" });

  const sessionId = randomUUID();
  await PlaySession.create({
    userId: me.id, sessionId, lastPingAt: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_MS)
  });

  return res.json({ url: (ch as any).url, sessionId });
}
