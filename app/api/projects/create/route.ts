import { NextResponse, NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const POST = async (req: NextRequest) => {
  const accessToken = req.cookies.get("access_token")?.value;
  const body = await req.json();

  const backendRes = await fetch(`${BACKEND_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await backendRes.json();

  return NextResponse.json(data, { status: backendRes.status });
};
