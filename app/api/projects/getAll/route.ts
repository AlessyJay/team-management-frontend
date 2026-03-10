import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const GET = async (req: NextRequest) => {
  const accessToken = req.cookies.get("access_token")?.value;

  const backendRes = await fetch(`${BACKEND_URL}/api/projects`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  const data = await backendRes.json();

  return NextResponse.json(data, { status: backendRes.status });
};
