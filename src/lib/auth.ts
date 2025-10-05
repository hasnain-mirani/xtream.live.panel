// src/lib/auth.ts
import jwt from "jsonwebtoken";

function readCookie(header: string | null, name: string) {
  if (!header) return null;
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(header);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Returns the user id if a valid user token is present.
 *  Accepts:
 *   - token (preferred, user dashboard)
 *   - admin_token (admin session) — only used if it actually contains a user id AND role!=='admin'
 *     (Some setups accidentally sign admin token with { uid } — we’ll read id|uid safely)
 */
export function getUserIdFromReqLike(req: { headers: { cookie?: string | null } }) {
  const cookie = req.headers?.cookie ?? "";
  const userJwt = readCookie(cookie, "token") || readCookie(cookie, "user_token");
  const adminJwt = readCookie(cookie, "admin_token"); // fallback only

  const tryDecode = (tok: string | null) => {
    if (!tok) return null;
    try {
      const p = jwt.verify(tok, process.env.JWT_SECRET || "dev-secret") as any;
      const id = p?.id || p?.uid || null;
      const role = p?.role || null;
      return { id, role };
    } catch { return null; }
  };

  // 1) Prefer the real user token
  const u = tryDecode(userJwt);
  if (u?.id) return u.id as string;

  // 2) Fallback: some apps put a *user* payload into admin_token (not recommended)
  const a = tryDecode(adminJwt);
  if (a?.id && a.role !== "admin") return a.id as string;

  return null;
}

/** For admin-only endpoints where we want the caller to act on-behalf of a user safely.
 *  Use header "x-act-as-user: <ObjectId>" and require role==="admin".
 */
export function getActAsUserId(req: { headers: { cookie?: string | null, [k:string]: any } }) {
  const cookie = req.headers?.cookie ?? "";
  const adminJwt = ((): string | null => {
    const v = /(?:^|;\s*)admin_token=([^;]+)/.exec(cookie);
    return v ? decodeURIComponent(v[1]) : null;
  })();
  try {
    const p = adminJwt ? (jwt.verify(adminJwt, process.env.JWT_SECRET || "dev-secret") as any) : null;
    if (p?.role !== "admin") return null;
    const u = String(req.headers["x-act-as-user"] || "").trim();
    return u || null;
  } catch { return null; }
}
