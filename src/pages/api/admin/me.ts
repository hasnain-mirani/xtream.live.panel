import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminFromReq } from "@/lib/adminAuth";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getAdminFromReq(req);
  if (!admin) return res.status(401).json({ message: "Not logged in (admin)" });
  return res.json({ admin });
}
