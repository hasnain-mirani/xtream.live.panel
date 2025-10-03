import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // clear the user cookie
  res.setHeader(
    "Set-Cookie",
    `token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  );
  return res.status(200).json({ ok: true });
}
