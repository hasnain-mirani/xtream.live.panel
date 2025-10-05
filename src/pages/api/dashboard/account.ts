// src/pages/api/dashboard/account.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserIdFromReq } from "@/lib/auth";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  try {
    await connectDB();
    const uid = getUserIdFromReq(req);
    if (!uid) return res.status(401).json({ message: "Not authenticated" });

    const u = await User.findById(uid)
      .select("name email verified role serviceUsername servicePassword createdAt")
      .lean();
    if (!u) return res.status(404).json({ message: "Account not found" });

    return res.json({
      id: String(u._id),
      name: u.name || "",
      email: u.email,
      verified: !!(u as any).verified,
      role: (u as any).role || "user",
      serviceUsername: (u as any).serviceUsername || null,
      servicePassword: (u as any).servicePassword || null,
      createdAt: u.createdAt,
    });
  } catch (e: any) {
    console.error("account error:", e?.message || e);
    return res.status(500).json({ message: "Server error" });
  }
}
