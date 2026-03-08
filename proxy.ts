import { NextResponse, NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];
const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

type Claims = {
  sub?: string;
  exp?: number;
  iat?: number;
  email?: string;
};

const decodeJwt = (token: string): Claims | null => {
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
};

const isAuthPage = (pathname: string) => {
  return AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );
};

const secondUntilExpiry = (token: string): number | null => {
  const payload = decodeJwt(token);

  if (!payload?.exp) return null;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now;
};

const tryRefresh = async (req: NextRequest): Promise<string | null> => {
  try {
    const refreshResponse = await fetch(
      `${req.nextUrl.origin}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
      },
    );

    if (!refreshResponse.ok) return null;

    const data = (await refreshResponse.json()) as { accessToken?: string };

    return data.accessToken ?? null;
  } catch {
    return null;
  }
};

export const proxy = async (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith(".")
  )
    return NextResponse.next();

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  const visitingAuthPage = isAuthPage(pathname);

  if (!accessToken) {
    return NextResponse.next();
  }

  const remaining = secondUntilExpiry(accessToken);

  if (remaining === null) {
    const res = NextResponse.next();
    res.cookies.delete(ACCESS_COOKIE);
    return res;
  }

  if (remaining > 30) {
    if (visitingAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  if (!refreshToken) {
    const res = visitingAuthPage ? NextResponse.next() : NextResponse.next();

    res.cookies.delete(ACCESS_COOKIE);

    return res;
  }

  const newAccessToken = await tryRefresh(req);

  if (!newAccessToken) {
    const res = NextResponse.next();
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

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
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
