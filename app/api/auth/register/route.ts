import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const backendRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

  return await backendRes.json();
};
