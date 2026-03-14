export type SprintStatus =
  | "PLANNING"
  | "ACTIVE"
  | "REVIEWING"
  | "REVIEWED"
  | "COMPLETED"
  | "CLOSED";

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

export const STATUS_OPTIONS: {
  value: SprintStatus;
  label: string;
  color: string;
}[] = [
  { value: "PLANNING", label: "Planning", color: "#a1a1aa" },
  { value: "ACTIVE", label: "Active", color: "#10b981" },
  { value: "REVIEWING", label: "Reviewing", color: "#3b82f6" },
  { value: "REVIEWED", label: "Reviewed", color: "#8b5cf6" },
  { value: "COMPLETED", label: "Completed", color: "#6366f1" },
  { value: "CLOSED", label: "Closed", color: "#ef4444" },
];

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
  status?: SprintStatus;
};

export type UpdateSprintPayload = Partial<
  Omit<CreateSprintPayload, "leadIds" | "memberIds">
>;

// ── Comment types ─────────────────────────────────────────────────────────────

export type ReactionType = "LIKE" | "LOVE" | "WOW" | "CHEERS" | "APPLAUSE";

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] =
  [
    { type: "LIKE", emoji: "👍", label: "Like" },
    { type: "LOVE", emoji: "❤️", label: "Love" },
    { type: "WOW", emoji: "😮", label: "Wow" },
    { type: "CHEERS", emoji: "🥂", label: "Cheers" },
    { type: "APPLAUSE", emoji: "👏", label: "Applause" },
  ];

export type CommentAuthor = { userId: string; name: string; email: string };

export type ReactionSummary = {
  reaction: ReactionType;
  count: number;
  userReacted: boolean;
};

export type SprintComment = {
  id: string;
  sprintId: string;
  author: CommentAuthor;
  content: string;
  parentId: string | null;
  reactions: ReactionSummary[];
  replies: SprintComment[];
  createdAt: string;
  updatedAt: string;
  edited: boolean;
};
