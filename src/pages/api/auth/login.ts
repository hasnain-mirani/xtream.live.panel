// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { connectDB as dbConnect } from "@/lib/db";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { email, password, remember } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    await dbConnect();

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).lean();
    if (!user?.passwordHash) return res.status(403).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(403).json({ error: "Invalid credentials" });

    // sign JWT (include role so admin pages work)
    const payload = { uid: String(user._id), role: user.role || "user" };
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "JWT secret not configured" });

    // 7d if remember, else session cookie (~12h here)
    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 12;

    const token = jwt.sign(payload, secret, { expiresIn: maxAge });

    // set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge,
        secure: process.env.NODE_ENV === "production", // in dev it's false
      })
    );

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("LOGIN ERROR:", e?.message || e);
    return res.status(500).json({ error: "Server error" });
  }
}
