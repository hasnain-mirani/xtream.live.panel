import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserFromReq } from "@/lib/jwt";
import { Subscription } from "@/models/Subscription";
// ...existing imports
import { PlaySession } from "@/models/PlaySession";
import { randomUUID } from "crypto";

const MAX_SESSIONS = 2;
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 min since last ping

interface HandlerRequest extends NextApiRequest {}
interface HandlerResponse extends NextApiResponse {}

interface User {
    id: string;
    // add other user fields if needed
}

interface PlaySessionDocument {
    userId: string;
    sessionId: string;
    lastPingAt: Date;
    expiresAt: Date;
}

export default async function handler(
    req: HandlerRequest,
    res: HandlerResponse
): Promise<void> {
    await connectDB();
    const me: User | null = getUserFromReq(req);
    if (!me) return res.status(401).json({ message: "Not logged in" });
    // ... your subscription access check

    // Clean old
    const now = Date.now();
    await PlaySession.deleteMany({ userId: me.id, lastPingAt: { $lt: new Date(now - SESSION_TTL_MS) } });

    const activeCount: number = await PlaySession.countDocuments({ userId: me.id });
    if (activeCount >= MAX_SESSIONS) {
        return res.status(429).json({ message: "Too many active sessions" });
    }

    const sessionId: string = randomUUID();
    await PlaySession.create({
        userId: me.id,
        sessionId,
        lastPingAt: new Date(),
        expiresAt: new Date(now + SESSION_TTL_MS) // for TTL cleanup
    } as PlaySessionDocument);

    return res.json({ url: process.env.HLS_URL, sessionId });
}


