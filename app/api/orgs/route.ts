import { NextRequest, NextResponse } from "next/server";
const B = process.env.NEXT_PUBLIC_BASE_URL!;

export const GET = async (req: NextRequest) => {
  const token = req.cookies.get("access_token")?.value;
  const res = await fetch(`${B}/api/orgs`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
};

export const POST = async (req: NextRequest) => {
  const token = req.cookies.get("access_token")?.value;
  const body = await req.json();
  const res = await fetch(`${B}/api/orgs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
};
