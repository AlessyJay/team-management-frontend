export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED";
export type SprintMemberRole = "LEAD" | "MEMBER";

export const SPRINT_CATEGORIES = [
  "Frontend",
  "Backend",
  "DevOps",
  "QA",
  "Design",
  "Infrastructure",
  "Data",
  "Security",
  "Other",
] as const;
export type SprintCategory = (typeof SPRINT_CATEGORIES)[number];

export const DURATION_OPTIONS = [
  { label: "1 week", value: "1 week", days: 7 },
  { label: "2 weeks", value: "2 weeks", days: 14 },
  { label: "1 month", value: "1 month", days: 30 },
  { label: "6 weeks", value: "6 weeks", days: 42 },
  { label: "2 months", value: "2 months", days: 60 },
  { label: "3 months", value: "3 months", days: 90 },
] as const;

export type SprintMember = {
  userId: string;
  name: string;
  email: string;
  role: SprintMemberRole;
};

export type Sprint = {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  category: string | null;
  tags: string[];
  expectedDuration: string | null;
  startDate: string;
  endDate: string | null;
  status: SprintStatus;
  leads: SprintMember[];
  members: SprintMember[];
  issueCount: number;
  doneCount: number;
  createdAt: string;
};

export type CreateSprintPayload = {
  name: string;
  goal?: string;
  category?: string;
  tags?: string[];
  expectedDuration?: string;
  startDate?: string;
  endDate?: string;
  leadIds?: string[];
  memberIds?: string[];
};

export type UpdateSprintPayload = Partial<
  Omit<CreateSprintPayload, "leadIds" | "memberIds">
>;
