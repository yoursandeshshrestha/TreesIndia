import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get("treesindia_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/auth/refresh-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    const { access_token, refresh_token } = data.data;

    // Create response with redirect
    const redirectTo =
      request.nextUrl.searchParams.get("redirect") || "/dashboard";
    const response_redirect = NextResponse.redirect(
      new URL(redirectTo, request.url)
    );

    // Set cookies
    response_redirect.cookies.set("treesindia_access_token", access_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    response_redirect.cookies.set("treesindia_refresh_token", refresh_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response_redirect;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
}
