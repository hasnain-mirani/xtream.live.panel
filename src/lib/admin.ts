import type { NextApiRequest, NextApiResponse } from "next";
export function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : hdr;
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
