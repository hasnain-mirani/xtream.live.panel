// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // keep empty or only protect /admin pages if you want
  return NextResponse.next();
}

// Only (optionally) guard admin pages/APIs
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"], // ❌ do NOT include /auth or /api/auth
};
