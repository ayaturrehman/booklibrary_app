import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/auth";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/auth/logout", "/api/public/"];
const PUBLIC_PREFIXES = ["/_next/", "/favicon", "/public/", "/uploads/"];

function isPublicPath(pathname) {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function isPublicApi(pathname) {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  if (isApiRoute && isPublicApi(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value || "";
  let session = null;
  try {
    session = await verifySessionToken(sessionToken);
  } catch (error) {
    console.error("Auth configuration error", error);
    return NextResponse.json(
      {
        error:
          "Authentication is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET.",
      },
      { status: 500 }
    );
  }

  if (!session) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
