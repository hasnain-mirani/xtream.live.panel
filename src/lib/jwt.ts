import jwt from "jsonwebtoken";
import type { NextApiRequest } from "next";
import { parse } from "cookie";
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
export type JWTPayload = { id: string; role: "user" | "admin" };
export function signToken(payload: JWTPayload, expiresIn = "7d"){ return jwt.sign(payload, JWT_SECRET, { expiresIn }); }
export function verifyToken(token: string): JWTPayload { return jwt.verify(token, JWT_SECRET) as JWTPayload; }
export function getUserFromReq(req: NextApiRequest): JWTPayload | null { const jar = parse(req.headers.cookie || ""); const token = jar["token"]; if(!token) return null; try { return verifyToken(token); } catch { return null; } }
