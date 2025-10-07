// pages/api/_debug/cookie-info.ts
import type { NextApiRequest, NextApiResponse } from "next";

function readCookie(header?: string | null, name = "token") {
  if (!header) return null;
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host || "";
  const xfProto = (req.headers["x-forwarded-proto"] as string) || "";
  const rawHeader = req.headers.cookie || "";
  const tokenTyped = (req as any).cookies?.token || null;
  const tokenParsed = readCookie(req.headers?.cookie, "token");

  res.json({
    host,
    x_forwarded_proto: xfProto,
    hasCookieHeader: Boolean(rawHeader),
    tokenInReqCookies: Boolean(tokenTyped),
    tokenFromHeaderParse: Boolean(tokenParsed),
    sameOrigin: typeof window === "undefined" ? true : window.location.host === host,
  });
}
