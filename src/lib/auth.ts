import jwt from "jsonwebtoken";

/** Internal: precompiled cookie matcher (name is injected). */
const COOKIE_RE = (name: string) =>
  new RegExp(String.raw`(?:^|;\s*)${name}=([^;]+)`);

/** Read a single cookie value from a raw Cookie header. */
function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) return null;
  const m = COOKIE_RE(name).exec(header);
  return m ? decodeURIComponent(m[1]) : null;
}

type ReqLike = { headers: { cookie?: string | null } & Record<string, unknown> };
type DecodedMinimal = { id?: string; uid?: string; role?: string } | null;

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/** Safe verify wrapper returning null on any error. */
function tryDecode(tok: string | null | undefined): DecodedMinimal {
  if (!tok) return null;
  try {
    return jwt.verify(tok, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

/**
 * Returns the user id if a valid user token is present.
 * Accepts:
 *  - token (preferred, user dashboard)
 *  - admin_token (admin session) — only used if it actually contains a user id AND role!=='admin'
 *    (Some setups accidentally sign admin token with { uid } — we’ll read id|uid safely)
 */
export function getUserIdFromReqLike(req: ReqLike): string | null {
  const cookie = req.headers?.cookie ?? "";

  // 1) Prefer the real user token (or legacy user_token)
  const userJwt = readCookie(cookie, "token") || readCookie(cookie, "user_token");
  const u = tryDecode(userJwt);
  const uId = (u?.id || u?.uid) ?? null;
  if (uId) return uId;

  // 2) Fallback: some apps put a *user* payload into admin_token (not recommended)
  const adminJwt = readCookie(cookie, "admin_token");
  const a = tryDecode(adminJwt);
  const aId = (a?.id || a?.uid) ?? null;
  if (aId && a?.role !== "admin") return aId;

  return null;
}

/**
 * For admin-only endpoints where we want the caller to act on-behalf of a user safely.
 * Use header "x-act-as-user: <ObjectId>" and require role==="admin".
 */
export function getActAsUserId(req: ReqLike): string | null {
  const cookie = req.headers?.cookie ?? "";

  // Read admin token directly (same regex style as readCookie to avoid logic changes)
  const v = COOKIE_RE("admin_token").exec(cookie);
  const adminJwt = v ? decodeURIComponent(v[1]) : null;

  try {
    const p = adminJwt ? (jwt.verify(adminJwt, JWT_SECRET) as any) : null;
    if (p?.role !== "admin") return null;

    // Honor the exact same header key used previously
    const u = String((req.headers as any)["x-act-as-user"] || "").trim();
    return u || null;
  } catch {
    return null;
  }
}
