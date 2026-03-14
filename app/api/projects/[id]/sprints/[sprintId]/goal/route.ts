import { NextRequest, NextResponse } from "next/server";
const BACKEND = process.env.NEXT_PUBLIC_BASE_URL!;
type P = { params: Promise<{ id: string; sprintId: string }> };

export const PATCH = async (req: NextRequest, { params }: P) => {
  const { id, sprintId } = await params;
  const token = req.cookies.get("access_token")?.value;
  const body = await req.json();
  const res = await fetch(
    `${BACKEND}/api/projects/${id}/sprints/${sprintId}/goal`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  return NextResponse.json(await res.json(), { status: res.status });
};
