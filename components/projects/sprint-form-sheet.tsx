"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  SPRINT_CATEGORIES,
  DURATION_OPTIONS,
  STATUS_OPTIONS,
  type Sprint,
  type CreateSprintPayload,
  type SprintStatus,
} from "@/types/sprint.types";
import type { ProjectMember } from "@/types/home.types";

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full resize-none rounded-md border border-white/10 bg-[rgba(255,255,255,0.05)] px-3 py-2 font-mono text-xs text-white transition-colors placeholder:text-zinc-600 focus:border-white/25 focus:outline-none disabled:opacity-50"
    />
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 font-mono text-xs transition-all ${
        active
          ? "bg-white font-semibold text-black"
          : "border border-white/10 bg-transparent text-zinc-500 hover:border-white/25 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MemberPill({
  member,
  roleLabel,
  onRemove,
}: {
  member: ProjectMember;
  roleLabel: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/4 px-2 py-1.5">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[9px] font-bold text-white">
        {member.name.charAt(0).toUpperCase()}
      </div>
      <span className="font-mono text-xs text-white">{member.name}</span>
      <span className="font-mono text-[10px] text-zinc-600">{roleLabel}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto font-mono text-xs text-zinc-600 transition-colors hover:text-red-400"
      >
        ×
      </button>
    </div>
  );
}

interface SprintFormSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectMembers: ProjectMember[];
  editSprint?: Sprint | null;
  onSubmit: (payload: CreateSprintPayload) => Promise<void>;
}

type DateMode = "duration" | "exact";

interface FormState {
  status: SprintStatus;
  name: string;
  goal: string;
  category: string;
  tags: string[];
  tagInput: string;
  dateMode: DateMode;
  expectedDuration: string;
  startDate: string;
  endDate: string;
  leads: ProjectMember[];
  members: ProjectMember[];
}

function initForm(edit?: Sprint | null): FormState {
  if (edit) {
    return {
      status: edit.status,
      name: edit.name,
      goal: edit.goal ?? "",
      category: edit.category ?? "",
      tags: edit.tags,
      tagInput: "",
      dateMode: edit.expectedDuration ? "duration" : "exact",
      expectedDuration: edit.expectedDuration ?? "",
      startDate: edit.startDate,
      endDate: edit.endDate ?? "",
      leads: [],
      members: [],
    };
  }
  return {
    status: "PLANNING",
    name: "",
    goal: "",
    category: "",
    tags: [],
    tagInput: "",
    dateMode: "duration",
    expectedDuration: "",
    startDate: "",
    endDate: "",
    leads: [],
    members: [],
  };
}

export function SprintFormSheet({
  open,
  onOpenChange,
  projectMembers,
  editSprint,
  onSubmit,
}: SprintFormSheetProps) {
  const [form, setForm] = useState<FormState>(() => initForm(editSprint));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editSprint;

  useEffect(() => {
    if (open) {
      setForm(initForm(editSprint));
      setError(null);
    }
  }, [open, editSprint]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = form.tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || form.tags.includes(t) || form.tags.length >= 8) return;
    set("tags", [...form.tags, t]);
    set("tagInput", "");
  };

  const alreadyAssigned = new Set([
    ...form.leads.map((m) => m.userId),
    ...form.members.map((m) => m.userId),
  ]);
  const available = projectMembers.filter(
    (m) => !alreadyAssigned.has(m.userId),
  );

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Sprint name is required");
      return;
    }
    if (form.dateMode === "duration" && !form.expectedDuration) {
      setError("Select an expected duration");
      return;
    }
    if (form.dateMode === "exact" && !form.startDate) {
      setError("Start date is required");
      return;
    }

    const payload: CreateSprintPayload = {
      name: form.name.trim(),
      status: form.status,
      ...(form.goal.trim() && { goal: form.goal.trim() }),
      ...(form.category && { category: form.category }),
      ...(form.tags.length && { tags: form.tags }),
      ...(form.dateMode === "duration"
        ? { expectedDuration: form.expectedDuration }
        : {
            startDate: form.startDate,
            ...(form.endDate && { endDate: form.endDate }),
          }),
      ...(!isEdit && {
        leadIds: form.leads.map((m) => m.userId),
        memberIds: form.members.map((m) => m.userId),
      }),
    };

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(payload);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-lg overflow-y-auto border-l border-white/[0.07] bg-[#0f1114] p-0"
      >
        <SheetHeader className="border-b border-white/[0.07] px-6 py-5">
          <SheetTitle className="font-mono text-sm font-semibold text-white">
            {isEdit ? "Edit Sprint" : "New Sprint"}
          </SheetTitle>
          <SheetDescription className="font-mono text-xs text-zinc-600">
            {isEdit
              ? "Update sprint details below."
              : "Fill in the details to create a new sprint."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Status */}
          <div className="flex flex-col gap-2">
            <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
              Status
            </Label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("status", opt.value)}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs transition-all ${
                    form.status === opt.value
                      ? "font-semibold text-black"
                      : "border border-white/10 bg-transparent text-zinc-500 hover:border-white/25 hover:text-white"
                  }`}
                  style={
                    form.status === opt.value
                      ? { backgroundColor: opt.color }
                      : {}
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
              Sprint Name *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Authentication sprint"
              className="border-white/10 bg-white/4 font-mono text-sm"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
              Description{" "}
              <span className="ml-2 text-zinc-700 normal-case">optional</span>
            </Label>
            <Textarea
              value={form.goal}
              onChange={(v) => set("goal", v)}
              placeholder="What is this sprint trying to achieve?"
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
              Category
            </Label>
            <div className="flex flex-wrap gap-2">
              {SPRINT_CATEGORIES.map((cat) => (
                <ToggleBtn
                  key={cat}
                  active={form.category === cat}
                  onClick={() =>
                    set("category", form.category === cat ? "" : cat)
                  }
                >
                  {cat}
                </ToggleBtn>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
              Tags{" "}
              <span className="ml-2 text-zinc-700 normal-case">up to 8</span>
            </Label>
            <div className="flex gap-2">
              <Input
                ref={tagInputRef}
                value={form.tagInput}
                onChange={(e) => set("tagInput", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a tag, press Enter"
                className="border-white/10 bg-white/4 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                className="shrink-0 border-white/10 font-mono text-xs"
              >
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-300"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "tags",
                          form.tags.filter((t) => t !== tag),
                        )
                      }
                      className="text-zinc-600 transition-colors hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                Timeline
              </Label>
              <div className="flex gap-1">
                <ToggleBtn
                  active={form.dateMode === "duration"}
                  onClick={() => set("dateMode", "duration")}
                >
                  Expected
                </ToggleBtn>
                <ToggleBtn
                  active={form.dateMode === "exact"}
                  onClick={() => set("dateMode", "exact")}
                >
                  Exact dates
                </ToggleBtn>
              </div>
            </div>

            {form.dateMode === "duration" ? (
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[11px] text-zinc-600">
                  Start date = today · End date = today + selected duration
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <ToggleBtn
                      key={opt.value}
                      active={form.expectedDuration === opt.value}
                      onClick={() =>
                        set(
                          "expectedDuration",
                          form.expectedDuration === opt.value ? "" : opt.value,
                        )
                      }
                    >
                      {opt.label}
                    </ToggleBtn>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="font-mono text-[10px] text-zinc-600">
                    Start Date *
                  </Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="border-white/10 bg-white/4 font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="font-mono text-[10px] text-zinc-600">
                    End Date
                  </Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="border-white/10 bg-white/4 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sprint people — only on create */}
          {!isEdit && (
            <>
              <div className="h-px bg-white/6" />

              {/* Leads */}
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                    Sprint Leads{" "}
                    <span className="ml-2 text-zinc-700 normal-case">
                      max 2
                    </span>
                  </Label>
                  <span className="font-mono text-[10px] text-zinc-700">
                    {form.leads.length}/2
                  </span>
                </div>
                {form.leads.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {form.leads.map((m) => (
                      <MemberPill
                        key={m.userId}
                        member={m}
                        roleLabel="Lead"
                        onRemove={() =>
                          set(
                            "leads",
                            form.leads.filter((l) => l.userId !== m.userId),
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                {form.leads.length < 2 && available.length > 0 && (
                  <div className="flex flex-col gap-1 rounded-md border border-white/6 bg-white/2 p-1">
                    {available.slice(0, 8).map((m) => (
                      <button
                        key={m.userId}
                        type="button"
                        onClick={() => {
                          if (form.leads.length < 2)
                            set("leads", [...form.leads, m]);
                        }}
                        className="flex items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/6"
                      >
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[9px] font-bold text-white">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-white">
                            {m.name}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-600">
                            {m.role}
                          </span>
                        </div>
                        <span className="ml-auto font-mono text-[10px] text-zinc-700">
                          + Lead
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Members */}
              <div className="flex flex-col gap-3">
                <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                  Sprint Members
                </Label>
                {form.members.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {form.members.map((m) => (
                      <MemberPill
                        key={m.userId}
                        member={m}
                        roleLabel="Member"
                        onRemove={() =>
                          set(
                            "members",
                            form.members.filter((x) => x.userId !== m.userId),
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                {available.filter(
                  (m) => !form.leads.find((l) => l.userId === m.userId),
                ).length > 0 && (
                  <div className="flex flex-col gap-1 rounded-md border border-white/6 bg-white/2 p-1">
                    {available
                      .filter(
                        (m) => !form.leads.find((l) => l.userId === m.userId),
                      )
                      .map((m) => (
                        <button
                          key={m.userId}
                          type="button"
                          onClick={() => set("members", [...form.members, m])}
                          className="flex items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/6"
                        >
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[9px] font-bold text-white">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-mono text-xs text-white">
                            {m.name}
                          </span>
                          <span className="ml-auto font-mono text-[10px] text-zinc-700">
                            + Member
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-white/[0.07] bg-[#0f1114] px-6 py-4">
          <Button
            variant="outline"
            className="border-white/10 font-mono text-xs"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="font-mono text-xs"
          >
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Sprint"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
