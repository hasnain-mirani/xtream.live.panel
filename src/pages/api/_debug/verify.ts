// pages/api/_debug/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

function readCookie(header?: string | null, name = "token") {
  if (!header) return null;
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = (req as any).cookies?.token || readCookie(req.headers?.cookie, "token");
  const secret = process.env.JWT_SECRET || "dev-secret";

  let verified: any = null, error: string | null = null;
  try {
    if (raw) verified = jwt.verify(raw, secret);
  } catch (e: any) {
    error = e?.message || "verify failed";
  }

  res.json({
    hasCookie: Boolean(raw),
    envHasSecret: Boolean(process.env.JWT_SECRET),
    error,
    verifiedKeys: verified ? Object.keys(verified) : null,
    verifiedPick: verified
      ? {
          id: verified.id ?? null,
          sub: verified.sub ?? null,
          uid: verified.uid ?? null,
          email: verified.email ?? null,
          role: verified.role ?? null,
        }
      : null,
  });
}
