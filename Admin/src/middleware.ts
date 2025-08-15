import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get tokens from cookies (we'll store them in cookies for middleware access)
  const accessToken = req.cookies.get("treesindia_access_token")?.value;
  const refreshToken = req.cookies.get("treesindia_refresh_token")?.value;

  // Public routes that don't need authentication
  const publicRoutes = ["/auth/sign-in", "/auth/sign-up"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin", "/settings", "/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Handle root route
  if (pathname === "/") {
    if (accessToken) {
      // User is authenticated, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      // User is not authenticated, redirect to sign-in
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  // Handle protected routes
  if (isProtectedRoute) {
    if (!accessToken && !refreshToken) {
      // No tokens, redirect to sign-in
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    if (!accessToken && refreshToken) {
      // Has refresh token but no access token, try to refresh
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";
        const refreshResponse = await fetch(
          `${backendUrl}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          }
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.data.access_token;

          // Create response with new token
          const response = NextResponse.next();
          response.cookies.set("treesindia_access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });

          return response;
        } else {
          // Refresh failed, redirect to sign-in
          const response = NextResponse.redirect(
            new URL("/auth/sign-in", req.url)
          );
          response.cookies.delete("treesindia_access_token");
          response.cookies.delete("treesindia_refresh_token");
          return response;
        }
      } catch (error) {
        // Refresh failed, redirect to sign-in
        const response = NextResponse.redirect(
          new URL("/auth/sign-in", req.url)
        );
        response.cookies.delete("treesindia_access_token");
        response.cookies.delete("treesindia_refresh_token");
        return response;
      }
    }

    // Has access token, allow access
    return NextResponse.next();
  }

  // Handle public routes (sign-in, sign-up)
  if (isPublicRoute) {
    if (accessToken) {
      // User is already authenticated, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // User is not authenticated, allow access to sign-in/sign-up
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
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};
