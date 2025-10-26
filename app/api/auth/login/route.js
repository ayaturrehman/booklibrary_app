import { NextResponse } from "next/server";
import {
  attachSessionCookie,
  createSessionToken,
  validateCredentials,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const payload = await request.json();
    const email = payload?.email?.toString().trim();
    const password = payload?.password?.toString();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    let valid;
    try {
      valid = validateCredentials(email, password);
    } catch (configError) {
      console.error("Auth configuration error", configError);
      return NextResponse.json(
        {
          error:
            "Authentication is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET.",
        },
        { status: 500 }
      );
    }
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createSessionToken({ email });
    const response = NextResponse.json({ success: true });
    attachSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { error: "Unable to login" },
      { status: 500 }
    );
  }
}
