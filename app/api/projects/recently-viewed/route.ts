import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const GET = async (req: NextRequest) => {
  const accessToken = req.cookies.get("access_token")?.value;

  const backendRes = await fetch(
    `${BACKEND_URL}/api/projects/recently-viewed`,
    {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
    },
  );

  if (!backendRes.ok) return NextResponse.json([], { status: 200 });

  const data = await backendRes.json();
  return NextResponse.json(data);
};
