// pages/api/dev/seed-admin.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { connectDB as dbConnect } from "@/lib/db";
import User from "@/models/User";

function isAuthorized(req: NextApiRequest) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s*/i, "");
  return token && token === process.env.ADMIN_TOKEN;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" }); // don't expose in prod
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });

  try {
    await dbConnect();

    const email = process.env.ADMIN_EMAIL;
    const plain = process.env.ADMIN_PASSWORD;
    if (!email || !plain) return res.status(400).json({ error: "ADMIN_EMAIL or ADMIN_PASSWORD missing" });

    const passwordHash = await bcrypt.hash(plain, 10);

    const user = await User.findOneAndUpdate(
      { email: String(email).toLowerCase().trim() },
      {
        $set: {
          name: "Admin",
          email: String(email).toLowerCase().trim(),
          passwordHash,
          role: "admin",
          isActive: true,
        },
      },
      { new: true, upsert: true }
    ).lean();

    return res.status(200).json({ ok: true, user: { id: String(user._id), email: user.email } });
  } catch (err: any) {
    console.error("seed-admin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
