"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconTrash,
  IconShield,
  IconUser,
  IconCrown,
  IconUserPlus,
  IconPencil,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStore } from "@/store/orgs.store";
import {
  getOrg,
  getOrgMembers,
  updateOrg,
  inviteOrgMember,
  updateOrgMemberRole,
  removeOrgMember,
  deleteOrg,
} from "@/queries/orgs.query";
import type { Org, OrgMember, OrgRole } from "@/types/orgs.types";

const ROLE_CONFIG: Record<
  OrgRole,
  { label: string; color: string; icon: React.ReactNode }
> = {
  OWNER: { label: "Owner", color: "#f59e0b", icon: <IconCrown size={12} /> },
  ADMIN: { label: "Admin", color: "#6366f1", icon: <IconShield size={12} /> },
  MEMBER: { label: "Member", color: "#a1a1aa", icon: <IconUser size={12} /> },
};

export default function OrgSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const orgId = params.orgId as string;
  const { userId } = useAuthStore();
  const { activeOrg, setActiveOrg } = useOrgStore();

  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [nameText, setNameText] = useState("");
  const [descText, setDescText] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: org, isLoading: loadingOrg } = useQuery<Org>({
    queryKey: ["org", orgId],
    queryFn: () => getOrg(orgId),
  });

  const { data: members = [], isLoading: loadingMembers } = useQuery<
    OrgMember[]
  >({
    queryKey: ["org-members", orgId],
    queryFn: () => getOrgMembers(orgId),
    enabled: !!org,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["org", orgId] });
    qc.invalidateQueries({ queryKey: ["org-members", orgId] });
    qc.invalidateQueries({ queryKey: ["orgs"] });
  };

  const updateMut = useMutation({
    mutationFn: (payload: Parameters<typeof updateOrg>[1]) =>
      updateOrg(orgId, payload),
    onSuccess: (updated) => {
      invalidate();
      if (activeOrg?.id === orgId) setActiveOrg(updated);
      setEditingName(false);
      setEditingDesc(false);
      toast.success("Organization updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const inviteMut = useMutation({
    mutationFn: () =>
      inviteOrgMember(orgId, { email: inviteEmail.trim(), role: inviteRole }),
    onSuccess: () => {
      invalidate();
      setInviteEmail("");
      toast.success("Member invited");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMut = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: "ADMIN" | "MEMBER" }) =>
      updateOrgMemberRole(orgId, uid, role),
    onSuccess: () => {
      invalidate();
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: (uid: string) => removeOrgMember(orgId, uid),
    onSuccess: (_, uid) => {
      invalidate();
      if (uid === userId) router.push("/");
      toast.success("Member removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteOrg(orgId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orgs"] });
      if (activeOrg?.id === orgId) setActiveOrg(null);
      toast.success("Organization deleted");
      router.push("/");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const myRole = org?.myRole ?? "MEMBER";
  const canManage = myRole === "OWNER" || myRole === "ADMIN";
  const isOwner = myRole === "OWNER";

  if (loadingOrg) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!org)
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="font-mono text-sm text-zinc-600">
          Organization not found.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          Go back
        </Button>
      </div>
    );

  return (
    <div className="size-full">
      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="flex cursor-pointer items-center gap-1.5 self-start font-mono text-xs text-zinc-600 transition-colors hover:text-white"
      >
        <IconArrowLeft size={12} /> Back
      </button>

      <div className="flex size-full flex-col items-center justify-center gap-8">
        <div className="w-2xl space-y-6">
          <div className="flex flex-col gap-5 rounded-xl border border-white/6 p-5">
            <h2 className="font-mono text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              Organization Settings
            </h2>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
                  Name
                </span>
                {canManage && !editingName && (
                  <button
                    onClick={() => {
                      setNameText(org.name);
                      setEditingName(true);
                    }}
                    className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-zinc-600 hover:text-white"
                  >
                    <IconPencil size={11} /> Edit
                  </button>
                )}
              </div>
              {editingName ? (
                <div className="flex gap-2">
                  <Input
                    value={nameText}
                    onChange={(e) => setNameText(e.target.value)}
                    className="border-white/10 bg-white/5 font-mono text-sm"
                  />
                  <button
                    onClick={() => updateMut.mutate({ name: nameText })}
                    disabled={updateMut.isPending || !nameText.trim()}
                    className="cursor-pointer rounded-md bg-white/10 p-2 text-white hover:bg-white/15 disabled:opacity-40"
                  >
                    <IconCheck size={13} />
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="cursor-pointer rounded-md p-2 text-zinc-600 hover:text-white"
                  >
                    <IconX size={13} />
                  </button>
                </div>
              ) : (
                <p className="font-mono text-sm text-white">{org.name}</p>
              )}
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
                Slug
              </span>
              <p className="font-mono text-sm text-zinc-400">org/{org.slug}</p>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
                  Description
                </span>
                {canManage && !editingDesc && (
                  <button
                    onClick={() => {
                      setDescText(org.description ?? "");
                      setEditingDesc(true);
                    }}
                    className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-zinc-600 hover:text-white"
                  >
                    <IconPencil size={11} /> Edit
                  </button>
                )}
              </div>
              {editingDesc ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={descText}
                    onChange={(e) => setDescText(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateMut.mutate({ description: descText })
                      }
                      disabled={updateMut.isPending}
                      className="flex cursor-pointer items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 font-mono text-[10px] text-white hover:bg-white/15 disabled:opacity-40"
                    >
                      <IconCheck size={11} /> Save
                    </button>
                    <button
                      onClick={() => setEditingDesc(false)}
                      className="flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 font-mono text-[10px] text-zinc-600 hover:text-white"
                    >
                      <IconX size={11} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-mono text-xs text-zinc-400">
                  {org.description ?? (
                    <span className="text-zinc-700 italic">No description</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="flex flex-col gap-4 rounded-xl border border-white/6 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                Members{" "}
                <span className="ml-2 text-zinc-700 normal-case">
                  {members.length}
                </span>
              </h2>
            </div>

            {/* Invite form — admins and owners */}
            {canManage && (
              <div className="flex flex-col gap-2 rounded-lg border border-white/6 bg-white/2 p-3">
                <span className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
                  <IconUserPlus size={11} /> Invite by email
                </span>
                <div className="flex gap-2">
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inviteEmail.trim())
                        inviteMut.mutate();
                    }}
                    className="border-white/10 bg-white/5 font-mono text-xs"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as "ADMIN" | "MEMBER")
                    }
                    className="rounded-md border border-white/10 bg-[#181b1f] px-2 font-mono text-xs text-white focus:outline-none"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <Button
                    size="sm"
                    onClick={() => inviteMut.mutate()}
                    disabled={!inviteEmail.trim() || inviteMut.isPending}
                    className="shrink-0 font-mono text-xs"
                  >
                    {inviteMut.isPending ? "Inviting…" : "Invite"}
                  </Button>
                </div>
              </div>
            )}

            {/* Member list */}
            {loadingMembers ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {members.map((m) => {
                  const cfg = ROLE_CONFIG[m.role];
                  const isMe = m.userId === userId;
                  return (
                    <div key={m.id} className="flex items-center gap-3 py-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[11px] font-bold text-white">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white">
                            {m.name}
                          </span>
                          {isMe && (
                            <span className="font-mono text-[9px] text-zinc-700">
                              (you)
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-zinc-600">
                          {m.email}
                        </span>
                      </div>

                      {/* Role badge / selector */}
                      {isOwner && m.role !== "OWNER" ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            roleMut.mutate({
                              uid: m.userId,
                              role: e.target.value as "ADMIN" | "MEMBER",
                            })
                          }
                          className="rounded-md border border-white/10 bg-[#181b1f] px-2 py-1 font-mono text-[10px] focus:outline-none"
                          style={{ color: cfg.color }}
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <span
                          className="flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px]"
                          style={{
                            color: cfg.color,
                            backgroundColor: `${cfg.color}15`,
                          }}
                        >
                          {cfg.icon} {cfg.label}
                        </span>
                      )}

                      {/* Joined */}
                      <span className="hidden font-mono text-[10px] text-zinc-700 sm:block">
                        {formatDistanceToNow(parseISO(m.joinedAt), {
                          addSuffix: true,
                        })}
                      </span>

                      {/* Remove */}
                      {(canManage && m.role !== "OWNER") || isMe ? (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${m.name}?`))
                              removeMut.mutate(m.userId);
                          }}
                          disabled={removeMut.isPending}
                          className="rounded p-1 text-zinc-700 transition-colors hover:text-red-400 disabled:opacity-40"
                        >
                          <IconTrash size={13} />
                        </button>
                      ) : (
                        <div className="size-6" /> // spacer
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Danger zone ─────────────────────────────────────────────────────── */}
          {isOwner && (
            <div className="flex flex-col gap-4 rounded-xl border border-red-500/20 p-5">
              <h2 className="font-mono text-xs font-semibold tracking-widest text-red-400 uppercase">
                Danger Zone
              </h2>
              {!confirmDelete ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-white">
                      Delete organization
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600">
                      Permanently deletes the org. Projects are not deleted.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                    className="border border-red-500/20 bg-red-500/10 font-mono text-xs text-red-400 hover:bg-red-500/20"
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-xs text-red-400">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => deleteMut.mutate()}
                      disabled={deleteMut.isPending}
                      className="border border-red-500/20 bg-red-500/20 font-mono text-xs text-red-400 hover:bg-red-500/30"
                    >
                      {deleteMut.isPending ? "Deleting…" : "Yes, delete"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                      className="border-white/10 font-mono text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
