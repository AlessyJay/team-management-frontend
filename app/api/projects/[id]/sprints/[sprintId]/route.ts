import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL!;

type P = { params: Promise<{ id: string; sprintId: string }> };

export const PATCH = async (req: NextRequest, { params }: P) => {
  const { id, sprintId } = await params;
  const token = req.cookies.get("access_token")?.value;
  const body = await req.json();
  const res = await fetch(`${BACKEND}/api/projects/${id}/sprints/${sprintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
};

export const DELETE = async (req: NextRequest, { params }: P) => {
  const { id, sprintId } = await params;
  const token = req.cookies.get("access_token")?.value;
  const res = await fetch(`${BACKEND}/api/projects/${id}/sprints/${sprintId}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  if (res.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await res.json(), { status: res.status });
};
