import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("treesindia_access_token")?.value;
  const refreshToken = req.cookies.get("treesindia_refresh_token")?.value;

  // If user is on sign-in page and has valid access token, redirect to dashboard
  if (pathname.startsWith("/auth/sign-in") && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Only run middleware on dashboard routes that need protection
  if (pathname.startsWith("/dashboard")) {
    // Case 1 — both missing
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    // Case 2 — missing access token but refresh token exists
    if (!accessToken && refreshToken) {
      return NextResponse.redirect(
        new URL(`/api/auth/refresh?redirect=${req.nextUrl.pathname}`, req.url)
      );
    }

    // Case 3 — access token present
    return NextResponse.next();
  }

  // For all other routes, just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match routes that need authentication checks
     */
    "/dashboard/:path*",
    "/auth/sign-in",
  ],
};
