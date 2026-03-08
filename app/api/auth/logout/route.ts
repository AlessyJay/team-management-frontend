import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const POST = async (req: NextRequest) => {
  await fetch(`${BACKEND_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      Authorization: req.headers.get("authorization") ?? "",
    },
    cache: "no-store",
  }).catch(() => null);

  const res = NextResponse.json({ message: "Logged out successfully!" });

  res.cookies.delete("access_token");
  res.cookies.delete("refresh_token");

  return res;
};
