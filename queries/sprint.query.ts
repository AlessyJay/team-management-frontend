import type {
  Sprint,
  CreateSprintPayload,
  UpdateSprintPayload,
  SprintMemberRole,
} from "@/types/sprint.types";
import type { ProjectMember } from "@/types/home.types";

const sprintBase = (pid: string) => `/api/projects/${pid}/sprints`;

export const getSprints = async (projectId: string): Promise<Sprint[]> => {
  const res = await fetch(sprintBase(projectId), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sprints");
  return res.json();
};

export const createSprint = async (
  projectId: string,
  payload: CreateSprintPayload,
): Promise<Sprint> => {
  const res = await fetch(`${sprintBase(projectId)}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to create sprint");
  }
  return res.json();
};

export const updateSprint = async (
  projectId: string,
  sprintId: string,
  payload: UpdateSprintPayload,
): Promise<Sprint> => {
  const res = await fetch(`${sprintBase(projectId)}/${sprintId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to update sprint");
  }
  return res.json();
};

export const deleteSprint = async (
  projectId: string,
  sprintId: string,
): Promise<void> => {
  const res = await fetch(`${sprintBase(projectId)}/${sprintId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to delete sprint");
  }
};

export const startSprint = async (
  projectId: string,
  sprintId: string,
): Promise<Sprint> => {
  const res = await fetch(`${sprintBase(projectId)}/${sprintId}/start`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to start sprint");
  }
  return res.json();
};

export const completeSprint = async (
  projectId: string,
  sprintId: string,
): Promise<Sprint> => {
  const res = await fetch(`${sprintBase(projectId)}/${sprintId}/complete`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to complete sprint");
  }
  return res.json();
};

export const addSprintMember = async (
  projectId: string,
  sprintId: string,
  userId: string,
  role: SprintMemberRole,
): Promise<void> => {
  const res = await fetch(`${sprintBase(projectId)}/${sprintId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to add member");
  }
};

export const removeSprintMember = async (
  projectId: string,
  sprintId: string,
  userId: string,
): Promise<void> => {
  const res = await fetch(
    `${sprintBase(projectId)}/${sprintId}/members/${userId}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to remove member");
  }
};

export const getProjectMembers = async (
  projectId: string,
): Promise<ProjectMember[]> => {
  const res = await fetch(`/api/projects/${projectId}/members`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
};
