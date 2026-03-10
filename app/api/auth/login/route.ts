import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await backendRes.text();

  if (!backendRes.ok) {
    return new NextResponse(text, {
      status: backendRes.status,
      headers: {
        "Content-Type":
          backendRes.headers.get("Content-Type") ?? "application/json",
      },
    });
  }

  const data = JSON.parse(text) as {
    accessToken: string;
    userId: string;
    email: string;
  };

  const res = NextResponse.json(data);

  // access_token: short-lived, stored in HttpOnly cookie
  res.cookies.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 2,
  });

  const setCookieHeaders = backendRes.headers.getSetCookie?.() ?? [];

  for (const raw of setCookieHeaders) {
    if (!raw.startsWith("refresh_token=")) continue;

    const tokenValue = raw.split(";")[0].slice("refresh_token=".length);

    res.cookies.set("refresh_token", tokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180, // 6 months
    });
  }

  return res;
};
