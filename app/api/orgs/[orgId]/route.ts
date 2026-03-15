import { NextRequest, NextResponse } from "next/server";
const B = process.env.NEXT_PUBLIC_BASE_URL!;
type P = { params: Promise<{ orgId: string }> };

export const GET = async (req: NextRequest, { params }: P) => {
  const { orgId } = await params;
  const token = req.cookies.get("access_token")?.value;
  const res = await fetch(`${B}/api/orgs/${orgId}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
};

export const PATCH = async (req: NextRequest, { params }: P) => {
  const { orgId } = await params;
  const token = req.cookies.get("access_token")?.value;
  const body = await req.json();
  const res = await fetch(`${B}/api/orgs/${orgId}`, {
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
  const { orgId } = await params;
  const token = req.cookies.get("access_token")?.value;

  await fetch(`${B}/api/orgs/${orgId}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });

  return new NextResponse(null, { status: 204 });
};
