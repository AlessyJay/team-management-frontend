import { NextRequest, NextResponse } from "next/server";
const BACKEND = process.env.NEXT_PUBLIC_BASE_URL!;
type P = {
  params: Promise<{ id: string; sprintId: string; commentId: string }>;
};

export const PATCH = async (req: NextRequest, { params }: P) => {
  const { id, sprintId, commentId } = await params;
  const token = req.cookies.get("access_token")?.value;
  const body = await req.json();
  const res = await fetch(
    `${BACKEND}/api/projects/${id}/sprints/${sprintId}/comments/${commentId}`,
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

export const DELETE = async (req: NextRequest, { params }: P) => {
  const { id, sprintId, commentId } = await params;
  const token = req.cookies.get("access_token")?.value;

  await fetch(
    `${BACKEND}/api/projects/${id}/sprints/${sprintId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: "no-store",
    },
  );

  return new NextResponse(null, { status: 204 });
};
