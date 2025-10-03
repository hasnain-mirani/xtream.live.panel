import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserFromReq } from "@/lib/jwt";
import { Event } from "@/models/Event";
import { PlaySession } from "@/models/PlaySession";
import { WatchProgress } from "@/models/WatchProgress";

const SESSION_TTL_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });

  const { playhead = 0, sessionId, channelKey } = req.body || {};
  await Event.create({ userId: me.id, type: "watch_ping", meta: { playhead: Number(playhead) || 0, channelKey, sessionId } });

  if (sessionId) {
    await PlaySession.updateOne(
      { sessionId },
      { $set: { lastPingAt: new Date(), expiresAt: new Date(Date.now()+SESSION_TTL_MS) } }
    );
  }
  if (channelKey) {
    await WatchProgress.findOneAndUpdate(
      { userId: me.id, channelKey },
      { $set: { playhead: Number(playhead) || 0 } },
      { upsert: true }
    );
  }
  return res.json({ ok: true });
}
