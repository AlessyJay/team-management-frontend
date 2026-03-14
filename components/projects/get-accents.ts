import { SprintStatus } from "@/types/sprint.types";

const ACCENTS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#0ea5e9",
  "#f97316",
];

export const getAccent = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return ACCENTS[Math.abs(h) % ACCENTS.length];
};

export const STATUS_CONFIG: Record<
  SprintStatus,
  { label: string; color: string; bg: string }
> = {
  PLANNING: {
    label: "Planning",
    color: "#a1a1aa",
    bg: "rgba(161,161,170,0.1)",
  },
  ACTIVE: { label: "Active", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  REVIEWING: {
    label: "Reviewing",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
  },
  REVIEWED: { label: "Reviewed", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  COMPLETED: {
    label: "Completed",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
  },
  CLOSED: { label: "Closed", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};
