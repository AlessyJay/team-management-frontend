import { Projects } from "@/types/home.types";

interface CreateProjectPayload {
  name: string;
  description?: string;
}

export const getAllProjects = async (): Promise<Projects[]> => {
  const res = await fetch("/api/projects/getAll", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

export const getRecentlyViewed = async (): Promise<Projects[]> => {
  const res = await fetch("/api/projects/recently-viewed", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
};

export const recordProjectView = async (projectId: string): Promise<void> => {
  await fetch(`/api/projects/${projectId}/view`, {
    method: "POST",
    cache: "no-store",
  });
};

export const createProject = async (
  payload: CreateProjectPayload,
): Promise<Projects> => {
  const res = await fetch("/api/projects/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to create project");
  }
  return res.json();
};
