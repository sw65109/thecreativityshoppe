import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

function isPublicFile(pathname: string) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function isAllowedDuringMaintenance(pathname: string) {
  if (pathname.startsWith("/maintenance")) return true;

  if (pathname.startsWith("/admin")) return true;

  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/signup")) return true;
  if (pathname.startsWith("/auth")) return true;

  if (pathname.startsWith("/api")) return true;

  if (pathname.startsWith("/_next")) return true;
  if (isPublicFile(pathname)) return true;

  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (MAINTENANCE_MODE && !isAllowedDuringMaintenance(pathname)) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  if (isPublicFile(pathname)) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};