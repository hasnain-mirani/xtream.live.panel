import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { getUserFromReq } from "@/lib/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();
  const me = getUserFromReq(req);
  if (!me) return res.status(401).json({ message: "Not logged in" });

  const active = await Subscription.findOneAndUpdate(
    { userId: me.id },
    { status: "active", trialEndsAt: null, activatedAt: new Date() },
    { upsert: true, new: true }
  ).lean();

  let status = null;
  if (active) {
    if (Array.isArray(active)) {
      status = active.length > 0 && active[0].status ? active[0].status : null;
    } else {
      status = (active as any).status ?? null;
    }
  }
  return res.json({ ok: true, status });
}
