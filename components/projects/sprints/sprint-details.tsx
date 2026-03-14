"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconCalendar,
  IconPencil,
  IconCheck,
  IconX,
  IconTag,
  IconSend,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccent, STATUS_CONFIG } from "@/components/projects/get-accents";
import {
  REACTIONS,
  type Sprint,
  type SprintComment,
} from "@/types/sprint.types";
import { useAuthStore } from "@/store/auth.store";

const base = (pid: string, sid: string) =>
  `/api/projects/${pid}/sprints/${sid}`;

async function fetchSprint(pid: string, sid: string): Promise<Sprint> {
  const res = await fetch(`${base(pid, sid)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Sprint not found");
  return res.json();
}

async function fetchComments(
  pid: string,
  sid: string,
): Promise<SprintComment[]> {
  const res = await fetch(`${base(pid, sid)}/comments`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

async function patchGoal(
  pid: string,
  sid: string,
  goal: string,
): Promise<Sprint> {
  const res = await fetch(`${base(pid, sid)}/goal`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => null);
    throw new Error(e?.message ?? "Failed to update");
  }
  return res.json();
}

async function postComment(
  pid: string,
  sid: string,
  content: string,
  parentId?: string,
) {
  const res = await fetch(`${base(pid, sid)}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, parentId: parentId ?? null }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => null);
    throw new Error(e?.message ?? "Failed to post");
  }
  return res.json();
}

async function patchComment(
  pid: string,
  sid: string,
  cid: string,
  content: string,
) {
  const res = await fetch(`${base(pid, sid)}/comments/${cid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to edit");
  return res.json();
}

async function deleteComment(pid: string, sid: string, cid: string) {
  await fetch(`${base(pid, sid)}/comments/${cid}`, { method: "DELETE" });
}

async function reactComment(
  pid: string,
  sid: string,
  cid: string,
  reaction: string,
) {
  const res = await fetch(`${base(pid, sid)}/comments/${cid}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reaction }),
  });
  if (!res.ok) throw new Error("Failed to react");
  return res.json();
}

function CommentItem({
  comment,
  projectId,
  sprintId,
  currentUserId,
  isSprintMember,
  depth = 0,
  onRefresh,
}: {
  comment: SprintComment;
  projectId: string;
  sprintId: string;
  currentUserId: string | null;
  isSprintMember: boolean;
  depth?: number;
  onRefresh: () => void;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const isOwn = comment.author.userId === currentUserId;
  const initials = comment.author.name.charAt(0).toUpperCase();

  const handleReact = async (reaction: string) => {
    if (!isSprintMember) return;
    await reactComment(projectId, sprintId, comment.id, reaction);
    onRefresh();
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await postComment(projectId, sprintId, replyText.trim(), comment.id);
      setReplyText("");
      setShowReplyBox(false);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setSubmitting(true);
    try {
      await patchComment(projectId, sprintId, comment.id, editText.trim());
      setEditMode(false);
      onRefresh();
    } catch {
      toast.error("Failed to edit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment and all its replies?")) return;
    try {
      await deleteComment(projectId, sprintId, comment.id);
      onRefresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? "pt-3 pl-8" : ""}`}>
      {/* Avatar */}
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[11px] font-bold text-white">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        {/* Author row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-white">
            {comment.author.name}
          </span>
          <span className="font-mono text-[10px] text-zinc-600">
            {formatDistanceToNow(parseISO(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {comment.edited && (
            <span className="font-mono text-[10px] text-zinc-700 italic">
              edited
            </span>
          )}
        </div>

        {/* Content */}
        {editMode ? (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={submitting}
                className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 font-mono text-[10px] text-white transition-colors hover:bg-white/15 disabled:opacity-50"
              >
                <IconCheck size={11} /> Save
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditText(comment.content);
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] text-zinc-500 transition-colors hover:text-white"
              >
                <IconX size={11} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 font-mono text-xs leading-relaxed text-zinc-300">
            {comment.content}
          </p>
        )}

        {/* Reactions bar */}
        {!editMode && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {REACTIONS.map(({ type, emoji, label }) => {
              const rx = comment.reactions.find((r) => r.reaction === type);
              const count = rx?.count ?? 0;
              const reacted = rx?.userReacted ?? false;
              return (
                <button
                  key={type}
                  title={label}
                  onClick={() => handleReact(type)}
                  className={`flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] transition-all ${
                    reacted
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-transparent text-zinc-600 hover:border-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-base">{emoji}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}

            {/* Action buttons */}
            <div className="ml-1 flex items-center gap-1">
              {isSprintMember && depth === 0 && (
                <button
                  onClick={() => {
                    setShowReplyBox(!showReplyBox);
                    setTimeout(() => replyRef.current?.focus(), 50);
                  }}
                  className="rounded px-2 py-0.5 font-mono text-[10px] text-zinc-600 transition-colors hover:text-white"
                >
                  Reply
                </button>
              )}
              {isOwn && !editMode && (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="rounded p-0.5 text-zinc-700 transition-colors hover:text-white"
                  >
                    <IconPencil size={11} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded p-0.5 text-zinc-700 transition-colors hover:text-red-400"
                  >
                    <IconTrash size={11} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {showReplyBox && (
          <div className="mt-3 flex gap-2">
            <textarea
              ref={replyRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.author.name}…`}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  handleReply();
              }}
              className="flex-1 resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || submitting}
              className="self-end rounded-md bg-white/10 p-2 text-white transition-colors hover:bg-white/15 disabled:opacity-40"
            >
              <IconSend size={13} />
            </button>
          </div>
        )}

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 font-mono text-[10px] text-zinc-600 transition-colors hover:text-white"
            >
              {showReplies ? (
                <IconChevronUp size={11} />
              ) : (
                <IconChevronDown size={11} />
              )}
              {comment.replies.length}{" "}
              {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
            {showReplies && (
              <div className="mt-2 flex flex-col gap-1 border-l border-white/6 pl-1">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    projectId={projectId}
                    sprintId={sprintId}
                    currentUserId={currentUserId}
                    isSprintMember={isSprintMember}
                    depth={1}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const projectId = params.id as string;
  const sprintId = params.sprintId as string;

  const { userId } = useAuthStore();

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const { data: sprint, isLoading: loadingSprint } = useQuery<Sprint>({
    queryKey: ["sprint", projectId, sprintId],
    queryFn: () => fetchSprint(projectId, sprintId),
  });

  const { data: comments = [], isLoading: loadingComments } = useQuery<
    SprintComment[]
  >({
    queryKey: ["comments", projectId, sprintId],
    queryFn: () => fetchComments(projectId, sprintId),
    enabled: !!sprint,
  });

  const refreshComments = () =>
    qc.invalidateQueries({ queryKey: ["comments", projectId, sprintId] });

  const isLead = sprint?.leads.some((l) => l.userId === userId) ?? false;
  const isMemberOfSprint =
    isLead || (sprint?.members.some((m) => m.userId === userId) ?? false);
  const canEditGoal = isLead; // managers are also checked server-side

  const startEditGoal = () => {
    setGoalText(sprint?.goal ?? "");
    setEditingGoal(true);
  };

  const saveGoal = async () => {
    if (!goalText.trim()) return;
    setSavingGoal(true);
    try {
      await patchGoal(projectId, sprintId, goalText.trim());
      await qc.invalidateQueries({ queryKey: ["sprint", projectId, sprintId] });
      setEditingGoal(false);
      toast.success("Description updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSavingGoal(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      await postComment(projectId, sprintId, newComment.trim());
      setNewComment("");
      refreshComments();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setPostingComment(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (loadingSprint) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="font-mono text-sm text-zinc-600">Sprint not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const accent = getAccent(sprint.name);
  const cfg = STATUS_CONFIG[sprint.status];
  const allMembers = [...sprint.leads, ...sprint.members];

  return (
    <div className="flex flex-col gap-8">
      <button
        onClick={() => router.push(`/projects/${projectId}`)}
        className="flex cursor-pointer items-center gap-1.5 self-start font-mono text-xs text-zinc-600 transition-colors hover:text-white"
      >
        <IconArrowLeft size={12} /> Back to project
      </button>

      <div
        className="rounded-xl border p-6"
        style={{
          background: `linear-gradient(135deg, ${accent}08 0%, transparent 60%), var(--card)`,
          borderColor: "rgba(255,255,255,0.07)",
          borderLeftColor: accent,
          borderLeftWidth: "3px",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {/* Name + category */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-lg font-bold tracking-tight text-white">
                {sprint.name}
              </h1>
              {sprint.category && (
                <span
                  className="rounded-md px-2 py-0.5 font-mono text-[10px] font-medium"
                  style={{ color: accent, backgroundColor: `${accent}15` }}
                >
                  {sprint.category}
                </span>
              )}
            </div>

            {/* Tags */}
            {sprint.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sprint.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500"
                  >
                    <IconTag size={9} />#{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-wrap items-center gap-4 text-zinc-600">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <IconCalendar size={11} />
                {format(parseISO(sprint.startDate), "MMM d, yyyy")}
                {sprint.endDate &&
                  ` → ${format(parseISO(sprint.endDate), "MMM d, yyyy")}`}
              </span>
              {sprint.expectedDuration && (
                <span className="font-mono text-[11px] text-zinc-700">
                  ~{sprint.expectedDuration}
                </span>
              )}
            </div>
          </div>

          {/* Status badge */}
          <span
            className="rounded-md px-3 py-1 font-mono text-xs font-medium"
            style={{ color: cfg.color, backgroundColor: cfg.bg }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Members row */}
        {allMembers.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-white/5 pt-4">
            {sprint.leads.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-600">
                  Leads
                </span>
                <div className="flex gap-1.5">
                  {sprint.leads.map((l) => (
                    <div
                      key={l.userId}
                      title={l.name}
                      className="flex size-6 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] font-bold text-white ring-1 ring-white/10"
                    >
                      {l.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sprint.members.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-600">
                  Members
                </span>
                <div className="flex gap-1.5">
                  {sprint.members.map((m) => (
                    <div
                      key={m.userId}
                      title={m.name}
                      className="flex size-6 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] font-bold text-white ring-1 ring-white/10"
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Description
          </h2>
          {canEditGoal && !editingGoal && (
            <button
              onClick={startEditGoal}
              className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-zinc-600 transition-colors hover:text-white"
            >
              <IconPencil size={11} /> Edit
            </button>
          )}
        </div>

        {editingGoal ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              rows={5}
              placeholder="Describe what this sprint aims to achieve…"
              className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={saveGoal}
                disabled={savingGoal || !goalText.trim()}
                className="font-mono text-xs"
              >
                {savingGoal ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingGoal(false)}
                className="border-white/10 font-mono text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : sprint.goal ? (
          <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-400">
            {sprint.goal}
          </p>
        ) : (
          <p className="font-mono text-xs text-zinc-700 italic">
            No description yet.{canEditGoal ? " Click Edit to add one." : ""}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-white/6 p-5">
        <h2 className="font-mono text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          Comments{comments.length > 0 && ` (${comments.length})`}
        </h2>

        {/* Comment list */}
        {loadingComments ? (
          <div className="flex flex-col gap-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="font-mono text-xs text-zinc-700 italic">
            {isMemberOfSprint
              ? "No comments yet. Be the first to say something."
              : "No comments yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-5 divide-y divide-white/5">
            {comments.map((c) => (
              <div key={c.id} className="pt-5 first:pt-0">
                <CommentItem
                  comment={c}
                  projectId={projectId}
                  sprintId={sprintId}
                  currentUserId={userId}
                  isSprintMember={isMemberOfSprint}
                  onRefresh={refreshComments}
                />
              </div>
            ))}
          </div>
        )}

        {isMemberOfSprint && (
          <div className="mt-2 flex gap-3 border-t border-white/6 pt-4">
            <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[11px] font-bold text-white">
              ?
            </div>
            <div className="flex flex-1 gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                placeholder="Write a comment… (Ctrl+Enter to post)"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                    handlePostComment();
                }}
                className="flex-1 resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
              />
              <button
                onClick={handlePostComment}
                disabled={!newComment.trim() || postingComment}
                className="self-end rounded-md bg-white/10 p-2 text-white transition-colors hover:bg-white/15 disabled:opacity-40"
              >
                <IconSend size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
