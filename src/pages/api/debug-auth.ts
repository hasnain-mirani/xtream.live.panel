import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerify } from "jose";

function readCookie(header?: string | null, name = "token") {
  if (!header) return null;
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = (req as any).cookies?.token || readCookie(req.headers?.cookie);
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

  let payload: any = null, error: string | null = null;
  try {
    if (raw) {
      const v = await jwtVerify(raw, secret);
      payload = { id: v.payload.id || v.payload.sub || v.payload.uid, role: v.payload.role };
    }
  } catch (e: any) {
    error = e?.message || "verify failed";
  }

  res.json({
    hasCookie: !!raw,
    payload,
    error,
    envHasSecret: !!process.env.JWT_SECRET,
  });
}
