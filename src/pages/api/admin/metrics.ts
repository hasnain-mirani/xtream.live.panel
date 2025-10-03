import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { Channel } from "@/models/Channel";

function dayBuckets(n: number) {
  const out: { label: string; start: Date; end: Date }[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    out.push({
      label: d.toLocaleDateString([], { month: "short", day: "2-digit" }),
      start,
      end,
    });
  }
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 🚫 disable caching completely
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    await connectDB();

    // optional `?days=7|14|30` (default 14)
    const daysParam = Math.max(1, Math.min(90, Number(req.query.days || 14)));
    const days = dayBuckets(daysParam);

    // Optional models (wrapped to avoid build errors if missing)
    let Event: any = null;
    let PlaySession: any = null;
    let WatchProgress: any = null;
    try { ({ Event } = await import("@/models/Event")); } catch {}
    try { ({ PlaySession } = await import("@/models/PlaySession")); } catch {}
    try { ({ WatchProgress } = await import("@/models/WatchProgress")); } catch {}

    // Headline
    const [totalUsers, channelsCount, activeSubs, trialSubs] = await Promise.all([
      User.countDocuments({}),
      Channel.countDocuments({}),
      Subscription.countDocuments({ status: "active" }),
      Subscription.countDocuments({ status: "trial" }),
    ]);

    // Better MRR (based on planMonths)
    const activeRows = await Subscription.find({ status: "active" }).select("planMonths").lean();
    const price = { 1: 9.99, 3: 27.99, 6: 49.99, 12: 79.99 } as Record<number, number>;
    const mrr = Number(
      activeRows.reduce((acc, s: any) => {
        const m = Number(s.planMonths) || 1;
        const p = price[m] ?? 9.99;
        return acc + p / m;
      }, 0).toFixed(2)
    );

    const activeSessions = PlaySession
      ? await PlaySession.countDocuments({ expiresAt: { $gte: new Date() } })
      : 0;

    const progressCount = WatchProgress
      ? await WatchProgress.countDocuments({})
      : 0;

    // Top channels (24h)
    let topChannels: { channel: string; pings: number }[] = [];
    if (Event) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const agg = await Event.aggregate([
        { $match: { type: "watch_ping", createdAt: { $gte: since } } },
        { $group: { _id: "$meta.channelKey", pings: { $sum: 1 } } },
        { $sort: { pings: -1 } },
        { $limit: 5 },
      ]);
      topChannels = agg.map((x: any) => ({ channel: x._id || "unknown", pings: x.pings }));
    }

    // Timeseries
    const signups = await Promise.all(
      days.map(async (b) => ({
        day: b.label,
        count: await User.countDocuments({ createdAt: { $gte: b.start, $lt: b.end } }),
      }))
    );

    const watch = await Promise.all(
      days.map(async (b) => ({
        day: b.label,
        count: Event
          ? await Event.countDocuments({ type: "watch_ping", createdAt: { $gte: b.start, $lt: b.end } })
          : 0,
      }))
    );

    return res.status(200).json({
      headline: {
        users: totalUsers,
        activeSubs,
        trials: trialSubs,
        mrr,
        channels: channelsCount,
        activeSessions,
        progressCount,
      },
      charts: { signups, watch, topChannels },
    });
  } catch (e: any) {
    console.error("metrics error:", e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
}
