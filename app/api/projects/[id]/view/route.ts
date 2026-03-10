import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const accessToken = req.cookies.get("access_token")?.value;

  await fetch(`${BACKEND_URL}/api/projects/${id}/view`, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  }).catch(() => null);

  return NextResponse.json(null, { status: 204 });
};
