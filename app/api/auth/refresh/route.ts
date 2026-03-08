import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const POST = async (req: NextRequest) => {
  const backendRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  const text = await backendRes.text();

  if (!backendRes.ok) {
    const res = new NextResponse(text || "Unauthorized", {
      status: backendRes.status,
    });

    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  }

  const data = JSON.parse(text) as { accessToken: string };

  const res = NextResponse.json(data);

  res.cookies.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 2,
  });

  return res;
};
