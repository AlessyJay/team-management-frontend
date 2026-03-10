import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL!;

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const token = req.cookies.get("access_token")?.value;
  const res = await fetch(`${BACKEND}/api/projects/${id}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
};
