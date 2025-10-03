import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromReq } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import { isAdminEmail } from "@/lib/is-admin-email";
import { User } from "@/models/User";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();
  const payload = getUserFromReq(req);
  if (!payload) return res.status(401).json({ message: "Not logged in" });
  const user = await User.findById(payload.id).select("name email role active");
  const role = isAdminEmail(user.email) ? "admin" : user.role;
  if (!user) return res.status(401).json({ message: "Not logged in" });
  return res.json({ user });
}
