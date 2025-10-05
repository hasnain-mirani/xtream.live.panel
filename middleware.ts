import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (url.pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login?next=" + url.pathname, req.url));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { role?: string };
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login?next=" + url.pathname, req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
