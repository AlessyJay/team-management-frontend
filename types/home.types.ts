export type ProjectStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type ActiveSprint = {
  id: string;
  name: string;
  endDate: string | null;
};

export type Projects = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  status: ProjectStatus;
  createdAt: string;
  joinedAt: string;
  memberCount: number;
  activeSprint: ActiveSprint | null;
  hasUrgentIssues: boolean;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  role: "MANAGER" | "MEMBER";
  joinedAt: string;
};
