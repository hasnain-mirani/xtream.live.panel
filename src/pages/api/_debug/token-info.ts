// pages/api/_debug/token-info.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

function readCookie(header?: string | null, name = "token") {
  if (!header) return null;
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = (req as any).cookies?.token || readCookie(req.headers?.cookie, "token");
  const decoded = raw ? jwt.decode(raw) : null;
  res.json({
    hasCookie: Boolean(raw),
    decodedType: decoded ? typeof decoded : null,
    payloadKeys: decoded && typeof decoded === "object" ? Object.keys(decoded as any) : null,
    payload: decoded && typeof decoded === "object"
      ? {
          id: (decoded as any).id ?? null,
          sub: (decoded as any).sub ?? null,
          uid: (decoded as any).uid ?? null,
          email: (decoded as any).email ?? null,
          role: (decoded as any).role ?? null,
          exp: (decoded as any).exp ?? null,
          iat: (decoded as any).iat ?? null,
        }
      : null,
  });
}
