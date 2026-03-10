import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL!;

type P = { params: Promise<{ id: string; sprintId: string; userId: string }> };

export const DELETE = async (req: NextRequest, { params }: P) => {
  const { id, sprintId, userId } = await params;
  const token = req.cookies.get("access_token")?.value;
  const res = await fetch(
    `${BACKEND}/api/projects/${id}/sprints/${sprintId}/members/${userId}`,
    {
      method: "DELETE",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: "no-store",
    },
  );
  if (res.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await res.json(), { status: res.status });
};
