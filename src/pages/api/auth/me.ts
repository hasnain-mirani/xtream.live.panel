import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {Subscription} from "@/models/Subscription"; // if you have it

type Resp =
  | { isLoggedIn: false }
  | {
      isLoggedIn: true;
      user: { id: string; name: string; email: string };
      onTrial: boolean;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "GET") return res.status(405).json({ isLoggedIn: false });

  try {
    await connectDB();

    const parsed = cookie.parse(req.headers.cookie || "");
    const token = parsed.token || parsed.admin_token; // support both if needed
    if (!token) return res.status(200).json({ isLoggedIn: false });

    let uid: string | null = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
      uid = decoded?.id || decoded?.uid || null;
    } catch {
      return res.status(200).json({ isLoggedIn: false });
    }
    if (!uid) return res.status(200).json({ isLoggedIn: false });

    const u = await User.findById(uid).select("_id name email").lean();
    if (!u) return res.status(200).json({ isLoggedIn: false });

    // Determine trial state (adjust if your model differs)
    let onTrial = false;
    try {
      const sub = await Subscription.findOne({ userId: String(u._id) })
        .select("status trialEndsAt")
        .lean();
      if (sub?.status === "trial" && sub?.trialEndsAt && new Date(sub.trialEndsAt).getTime() > Date.now()) {
        onTrial = true;
      }
    } catch {
      /* no Subscription model or not used */
    }

    return res.status(200).json({
      isLoggedIn: true,
      user: { id: String(u._id), name: u.name || "", email: u.email || "" },
      onTrial,
    });
  } catch (e) {
    // never 500 to client; just say not logged in to avoid UI breaking
    return res.status(200).json({ isLoggedIn: false });
  }
}
