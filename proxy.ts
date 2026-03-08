import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

const AUTH_PAGES = ["/login", "/register"];
const PUBLIC_PATHS = [...AUTH_PAGES];

type Claims = {
  sub?: string;
  exp?: number;
  iat?: number;
  email?: string;
};

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  );
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api");
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );
}

function decodeJwt(token: string): Claims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as Claims;
  } catch {
    return null;
  }
}

function secondsUntilExpiry(token: string): number | null {
  const payload = decodeJwt(token);
  if (!payload?.exp) return null;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now;
}

async function tryRefresh(req: NextRequest): Promise<string | null> {
  try {
    const res = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { accessToken?: string };
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);

  if (req.nextUrl.pathname !== "/") {
    const fullPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    loginUrl.searchParams.set("redirectTo", fullPath);
  }

  return NextResponse.redirect(loginUrl);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticAsset(pathname) || isApiRoute(pathname)) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  const visitingAuthPage = isAuthPage(pathname);
  const visitingPublicPath = isPublicPath(pathname);

  // Guest user (not logged in)
  if (!accessToken) {
    if (visitingPublicPath) {
      return NextResponse.next();
    }

    return redirectToLogin(req);
  }

  const remaining = secondsUntilExpiry(accessToken);

  // Broken/invalid access token
  if (remaining === null) {
    const res = visitingPublicPath ? NextResponse.next() : redirectToLogin(req);
    res.cookies.delete(ACCESS_COOKIE);
    return res;
  }

  // Access token still healthy
  if (remaining > 30) {
    if (visitingAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // Need refresh soon
  if (!refreshToken) {
    const res = visitingPublicPath ? NextResponse.next() : redirectToLogin(req);
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  const newAccessToken = await tryRefresh(req);

  // Refresh failed
  if (!newAccessToken) {
    const res = visitingPublicPath ? NextResponse.next() : redirectToLogin(req);
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  // Refresh succeeded
  const res = visitingAuthPage
    ? NextResponse.redirect(new URL("/", req.url))
    : NextResponse.next();

  res.cookies.set(ACCESS_COOKIE, newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 2,
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
