import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import type { IUser } from "@/models/User";
import bcrypt from "bcryptjs";
import { signAdminToken } from "@/lib/adminAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();

  const { email, password } = req.body || {};
  const u = await User.findOne({ email }).lean<IUser>();
  if (!u || !u.passwordHash || !(await bcrypt.compare(password, u.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (u.role !== "admin") {
    return res.status(403).json({ message: "Not an admin account" });
  }

  const token = signAdminToken({ id: String(u._id), email: u.email, role: "admin" });
  // separate cookie, admin-only
  res.setHeader("Set-Cookie",
    `admin_token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60*60*24*7}`
  );
  return res.json({ ok: true });
}
