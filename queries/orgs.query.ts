import type {
  Org,
  OrgMember,
  CreateOrgPayload,
  UpdateOrgPayload,
  InviteMemberPayload,
} from "@/types/orgs.types";

export const getMyOrgs = async (): Promise<Org[]> => {
  const res = await fetch("/api/orgs", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch organizations");
  return res.json();
};

export const getOrg = async (orgSlug: string): Promise<Org> => {
  const res = await fetch(`/api/orgs/${orgSlug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Organization not found");
  return res.json();
};

export const createOrg = async (payload: CreateOrgPayload): Promise<Org> => {
  const res = await fetch("/api/orgs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to create organization");
  }
  return res.json();
};

export const updateOrg = async (
  orgId: string,
  payload: UpdateOrgPayload,
): Promise<Org> => {
  const res = await fetch(`/api/orgs/${orgId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to update organization");
  }
  return res.json();
};

export const deleteOrg = async (orgId: string): Promise<void> => {
  const res = await fetch(`/api/orgs/${orgId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to delete organization");
  }
};

export const getOrgMembers = async (orgId: string): Promise<OrgMember[]> => {
  const res = await fetch(`/api/orgs/${orgId}/members`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
};

export const inviteOrgMember = async (
  orgId: string,
  payload: InviteMemberPayload,
): Promise<OrgMember> => {
  const res = await fetch(`/api/orgs/${orgId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to invite member");
  }
  return res.json();
};

export const updateOrgMemberRole = async (
  orgId: string,
  userId: string,
  role: "ADMIN" | "MEMBER",
): Promise<OrgMember> => {
  const res = await fetch(`/api/orgs/${orgId}/members/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to update role");
  }
  return res.json();
};

export const removeOrgMember = async (
  orgId: string,
  userId: string,
): Promise<void> => {
  const res = await fetch(`/api/orgs/${orgId}/members/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to remove member");
  }
};
