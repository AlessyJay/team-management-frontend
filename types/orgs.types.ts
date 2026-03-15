export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";

export type OrgMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: OrgRole;
  joinedAt: string;
};

export type Org = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: string;
  memberCount: number;
  myRole: OrgRole;
  createdAt: string;
};

export type CreateOrgPayload = {
  name: string;
  slug?: string;
  description?: string;
};

export type UpdateOrgPayload = {
  name?: string;
  description?: string;
  logoUrl?: string;
};

export type InviteMemberPayload = {
  email: string;
  role?: "ADMIN" | "MEMBER";
};
