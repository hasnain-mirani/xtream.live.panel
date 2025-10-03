import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== "development") return res.status(403).json({ message: "Disabled" });
  await connectDB();
  const email = "admin@demo.local";
  const passwordHash = await bcrypt.hash("admin123", 10);
  const doc = await User.findOneAndUpdate(
    { email },
    { email, name:"Admin", passwordHash, role:"admin", active:true, verified:true },
    { upsert:true, new:true }
  ).lean();
  res.json({ 
    ok: true, 
    email, 
    password: "admin123", 
    id: doc
      ? Array.isArray(doc)
        ? doc.length > 0 && doc[0]._id ? String(doc[0]._id) : null
        : doc._id ? String(doc._id) : null
      : null
  });
}
