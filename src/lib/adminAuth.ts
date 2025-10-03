import jwt from "jsonwebtoken";
import type { NextApiRequest } from "next";
import { verifyToken as verifyUserJWT } from "@/lib/jwt"; // your user JWT helper

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "dev-admin-secret";

type AdminPayload = { id: string; email?: string; role: "admin" };

export function signAdminToken(p: AdminPayload) {
  return jwt.sign(p, ADMIN_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token?: string): AdminPayload | null {
  try { return token ? (jwt.verify(token, ADMIN_SECRET) as AdminPayload) : null; }
  catch { return null; }
}

// Accept:
// 1) Cookie: admin_token
// 2) Header: Authorization: Bearer <admin_token>
// 3) Fallback to user token cookie "token" if role === "admin"
export function getAdminFromReq(req: NextApiRequest): AdminPayload | null {
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
  const fromCookie = m ? decodeURIComponent(m[1]) : "";

  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

  let admin = verifyAdminToken(fromCookie || bearer);
  if (admin) return admin;

  // fallback to user session if user role is admin
  const user = verifyUserJWT((cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1] && decodeURIComponent(cookie.match(/(?:^|;\s*)token=([^;]+)/)![1])) || "");
  if (user?.role === "admin") {
    return { id: user.id, role: "admin" };
  }
  return null;
}
