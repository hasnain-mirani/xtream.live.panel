import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Missing email/password" });

  const u = await User.findOne({ email });
  if (!u || !u.passwordHash || !(await bcrypt.compare(password, u.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (u.role !== "user" && u.role !== "admin" && u.role !== "fleet_manager") {
    return res.status(403).json({ message: "Account disabled" });
  }

  const token = jwt.sign({ id: String(u._id), role: "user" }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
  // NOTE: cookie name is `token` (user) — different from `admin_token`
  res.setHeader("Set-Cookie", `token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7*24*60*60}`);
  return res.json({ ok: true, id: String(u._id) });
}
