import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Debug: log pathname and raw Cookie header to help trace redirect loops
  // Remove these logs after debugging.
  try {
    // eslint-disable-next-line no-console
    console.log("middleware:", { pathname, cookieHeader: request.headers.get("cookie") });
  } catch (e) {
    // ignore logging errors in edge runtime
  }

  // Only enforce auth for the dashboard and properties routes
  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/properties")) {
    return NextResponse.next();
  }

  // Check for NextAuth session cookie (works for both default and custom session tokens)
  const sessionCookie =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token") ||
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("auth.session-token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/properties/:path*"],
};