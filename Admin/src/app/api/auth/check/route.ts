import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // This is a server-side check, so we can't access localStorage directly
    // Instead, we'll check if the user has a valid token by making a request to the backend
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Make a request to the backend to validate the token
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";
    const response = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return NextResponse.json({ isAuthenticated: true }, { status: 200 });
    } else {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }
}
