import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

function isPublicFile(pathname: string) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

export function middleware(req: NextRequest) {
  if (!MAINTENANCE_MODE) return NextResponse.next();

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next")) return NextResponse.next();

  if (isPublicFile(pathname)) return NextResponse.next();

  if (pathname.startsWith("/maintenance")) return NextResponse.next();

  if (pathname.startsWith("/admin")) return NextResponse.next();

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) return NextResponse.next();

  return NextResponse.redirect(new URL("/maintenance", req.url));
}

export const config = {
  matcher: ["/:path*"],
};