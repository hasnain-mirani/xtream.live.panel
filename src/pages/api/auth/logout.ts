import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // expire both normal and admin cookies just in case
  res.setHeader("Set-Cookie", [
    "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    "admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  ]);
  res.status(200).json({ ok: true });
}
