/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconPlus,
  IconUsers,
  IconCalendar,
  IconAlertTriangle,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SprintFormSheet } from "@/components/projects/sprint-form-sheet";

import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  getProjectMembers,
} from "@/queries/sprint.query";
import type { Sprint } from "@/types/sprint.types";
import type { Projects, ProjectMember } from "@/types/home.types";
import { getAccent } from "@/components/projects/get-accents";
import { OverviewPanel } from "@/components/projects/overview";
import { MembersPanel } from "@/components/projects/member-panel";
import { SprintGroup } from "@/components/projects/sprint-group";
import { useAuthStore } from "@/store/auth.store";
import Loading from "@/components/projects/loading";

type Tab = "overview" | "sprints" | "members";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("overview");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: project, isLoading: loadingProject } = useQuery<Projects>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Project not found");
      return res.json();
    },
  });

  const { data: sprints = [], isLoading: loadingSprints } = useQuery<Sprint[]>({
    queryKey: ["sprints", projectId],
    queryFn: () => getSprints(projectId),
    enabled: !!project,
  });

  const { data: members = [] } = useQuery<ProjectMember[]>({
    queryKey: ["members", projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!project,
  });

  const { userId } = useAuthStore();
  const isManager = members.some(
    (m) => m.userId === userId && m.role === "MANAGER",
  );

  const invalidateSprints = () =>
    qc.invalidateQueries({ queryKey: ["sprints", projectId] });

  const createMut = useMutation({
    mutationFn: (payload: Parameters<typeof createSprint>[1]) =>
      createSprint(projectId, payload),
    onSuccess: () => {
      invalidateSprints();
      toast.success("Sprint created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateSprint>[2];
    }) => updateSprint(projectId, id, payload),
    onSuccess: () => {
      invalidateSprints();
      toast.success("Sprint updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (sprintId: string) => deleteSprint(projectId, sprintId),
    onSuccess: () => {
      invalidateSprints();
      setDeletingId(null);
      toast.success("Sprint deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startMut = useMutation({
    mutationFn: (sprintId: string) => startSprint(projectId, sprintId),
    onSuccess: () => {
      invalidateSprints();
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Sprint started");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const completeMut = useMutation({
    mutationFn: (sprintId: string) => completeSprint(projectId, sprintId),
    onSuccess: () => {
      invalidateSprints();
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Sprint completed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFormSubmit = async (
    payload: Parameters<typeof createSprint>[1],
  ) => {
    if (editingSprint) {
      await updateMut.mutateAsync({ id: editingSprint.id, payload });
    } else {
      await createMut.mutateAsync(payload);
    }
  };

  const openCreate = () => {
    setEditingSprint(null);
    setSheetOpen(true);
  };
  const openEdit = (s: Sprint) => {
    setEditingSprint(s);
    setSheetOpen(true);
  };

  if (loadingProject) {
    return <Loading />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="font-mono text-sm text-zinc-600">Project not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          Go back
        </Button>
      </div>
    );
  }

  const accent = getAccent(project.name);
  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const grouped = {
    ACTIVE: sprints.filter((s) => s.status === "ACTIVE"),
    PLANNING: sprints.filter((s) => s.status === "PLANNING"),
    COMPLETED: sprints.filter((s) => s.status === "COMPLETED"),
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex cursor-pointer items-center gap-1.5 self-start font-mono text-xs text-zinc-600 transition-colors hover:text-white"
        >
          <IconArrowLeft size={12} /> All projects
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black text-white"
                style={{
                  backgroundColor: `${accent}25`,
                  border: `1px solid ${accent}40`,
                }}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="font-mono text-xl font-bold tracking-tight text-white">
                {project.name}
              </h1>
              <span
                className="rounded-md px-2 py-0.5 font-mono text-[10px] font-medium"
                style={{
                  color: project.status === "ACTIVE" ? "#10b981" : "#a1a1aa",
                  backgroundColor:
                    project.status === "ACTIVE"
                      ? "rgba(16,185,129,0.1)"
                      : "rgba(161,161,170,0.1)",
                }}
              >
                {project.status}
              </span>
              {project.hasUrgentIssues && (
                <span className="flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] text-red-400">
                  <IconAlertTriangle size={10} /> Urgent
                </span>
              )}
            </div>
            {project.description && (
              <p className="max-w-xl font-mono text-xs text-zinc-500">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-zinc-700">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <IconUsers size={10} /> {members.length} member
                {members.length !== 1 ? "s" : ""}
              </span>
              <span className="font-mono text-[10px]">
                Created{" "}
                {formatDistanceToNow(parseISO(project.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {activeSprint && (
                <span
                  className="flex items-center gap-1 font-mono text-[10px]"
                  style={{ color: `${accent}cc` }}
                >
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                  {activeSprint.name}
                </span>
              )}
            </div>
          </div>

          {tab === "sprints" && isManager && (
            <Button
              onClick={openCreate}
              size="sm"
              className="shrink-0 font-mono text-xs"
            >
              <IconPlus size={13} className="mr-1" /> New Sprint
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-white/6">
        <div className="flex items-center gap-1">
          {(["overview", "sprints", "members"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative cursor-pointer px-4 pt-0 pb-3 font-mono text-xs capitalize transition-colors ${
                tab === t ? "text-white" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {t}
              {t === "sprints" && sprints.length > 0 && (
                <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
                  {sprints.length}
                </span>
              )}
              {t === "members" && members.length > 0 && (
                <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
                  {members.length}
                </span>
              )}
              {tab === t && (
                <span
                  className="absolute right-0 bottom-0 left-0 h-px"
                  style={{ backgroundColor: accent }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <OverviewPanel project={project} sprints={sprints} members={members} />
      )}

      {tab === "sprints" && (
        <div className="flex flex-col gap-8">
          {loadingSprints ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : sprints.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div
                className="flex size-12 items-center justify-center rounded-xl"
                style={{
                  background: `${accent}15`,
                  border: `1px solid ${accent}25`,
                }}
              >
                <IconCalendar size={22} style={{ color: accent }} />
              </div>
              <div className="text-center">
                <p className="font-mono text-sm text-white">No sprints yet</p>
                <p className="mt-1 font-mono text-xs text-zinc-600">
                  {isManager
                    ? "Create your first sprint to start tracking work."
                    : "No sprints have been created for this project yet."}
                </p>
              </div>
              {isManager && (
                <Button
                  onClick={openCreate}
                  size="sm"
                  className="font-mono text-xs"
                >
                  <IconPlus size={13} className="mr-1" /> Create first sprint
                </Button>
              )}
            </div>
          ) : (
            <>
              {grouped.ACTIVE.length > 0 && (
                <SprintGroup
                  title="Active"
                  color="#10b981"
                  sprints={grouped.ACTIVE}
                  projectId={projectId}
                  isManager={isManager}
                  onEdit={openEdit}
                  onDelete={(s) => setDeletingId(s.id)}
                  onStart={(s) => startMut.mutate(s.id)}
                  onComplete={(s) => completeMut.mutate(s.id)}
                />
              )}
              {grouped.PLANNING.length > 0 && (
                <SprintGroup
                  title="Planning"
                  color="#a1a1aa"
                  sprints={grouped.PLANNING}
                  projectId={projectId}
                  isManager={isManager}
                  onEdit={openEdit}
                  onDelete={(s) => setDeletingId(s.id)}
                  onStart={(s) => startMut.mutate(s.id)}
                  onComplete={(s) => completeMut.mutate(s.id)}
                />
              )}
              {grouped.COMPLETED.length > 0 && (
                <SprintGroup
                  title="Completed"
                  color="#6366f1"
                  sprints={grouped.COMPLETED}
                  projectId={projectId}
                  isManager={isManager}
                  onEdit={openEdit}
                  onDelete={(s) => setDeletingId(s.id)}
                  onStart={(s) => startMut.mutate(s.id)}
                  onComplete={(s) => completeMut.mutate(s.id)}
                />
              )}
            </>
          )}
        </div>
      )}

      {tab === "members" && (
        <MembersPanel members={members} ownerId={project.ownerId} />
      )}

      <SprintFormSheet
        open={sheetOpen}
        onOpenChange={(v: any) => {
          setSheetOpen(v);
          if (!v) setEditingSprint(null);
        }}
        projectMembers={members}
        editSprint={editingSprint}
        onSubmit={handleFormSubmit}
      />

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#181b1f] p-6 shadow-2xl">
            <h2 className="mb-2 font-mono text-sm font-semibold text-white">
              Delete sprint?
            </h2>
            <p className="mb-6 font-mono text-xs text-zinc-500">
              This will permanently delete the sprint and all its capacity
              settings. Issues will remain in backlog.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 font-mono text-xs"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="border border-red-500/20 bg-red-500/20 font-mono text-xs text-red-400 hover:bg-red-500/30"
                onClick={() => deleteMut.mutate(deletingId)}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
