/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  differenceInDays,
  parseISO,
  format,
  formatDistanceToNow,
} from "date-fns";
import { getAccent, STATUS_CONFIG } from "./get-accents";
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconPencil,
  IconPlayerPlay,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";
import { ProgressBar } from "./progress-bar";
import { AvatarStack } from "./avatar-stacks";
import { Sprint } from "@/types/sprint.types";

export const SprintCard = ({
  sprint,
  projectId,
  isManager,
  onEdit,
  onDelete,
  onStart,
  onComplete,
}: {
  sprint: Sprint;
  projectId: string;
  isManager: boolean;
  onEdit: (s: Sprint) => void;
  onDelete: (s: Sprint) => void;
  onStart: (s: Sprint) => void;
  onComplete: (s: Sprint) => void;
}) => {
  const accent = getAccent(sprint.name);
  const cfg = STATUS_CONFIG[sprint.status];
  const allMembers = [...sprint.leads, ...sprint.members];

  const daysLeft = sprint.endDate
    ? differenceInDays(parseISO(sprint.endDate), new Date())
    : null;
  const isOverdue =
    daysLeft !== null && daysLeft < 0 && sprint.status === "ACTIVE";
  const isUrgent =
    daysLeft !== null &&
    daysLeft >= 0 &&
    daysLeft <= 3 &&
    sprint.status === "ACTIVE";

  return (
    <div
      className="group relative flex flex-col gap-4 rounded-xl border p-5 transition-all duration-200"
      style={{
        background: `linear-gradient(135deg, ${accent}08 0%, transparent 50%), var(--card)`,
        borderColor: "rgba(255,255,255,0.07)",
        borderLeftColor: accent,
        borderLeftWidth: "3px",
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm leading-tight font-semibold text-white">
              {sprint.name}
            </h3>
            {sprint.category && (
              <span
                className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium"
                style={{ color: accent, backgroundColor: `${accent}15` }}
              >
                {sprint.category}
              </span>
            )}
          </div>
          {sprint.goal && (
            <p className="mt-1 line-clamp-2 font-mono text-xs text-zinc-500">
              {sprint.goal}
            </p>
          )}
        </div>

        {/* Status + actions */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 font-mono text-[10px] font-medium"
            style={{ color: cfg.color, backgroundColor: cfg.bg }}
          >
            {cfg.label}
          </span>

          {isManager && (
            <div className="flex items-center gap-1">
              {sprint.status === "PLANNING" && (
                <button
                  title="Start sprint"
                  onClick={() => onStart(sprint)}
                  className="rounded p-1 text-zinc-600 transition-colors hover:text-green-400"
                >
                  <IconPlayerPlay size={13} />
                </button>
              )}
              {sprint.status === "ACTIVE" && (
                <button
                  title="Complete sprint"
                  onClick={() => onComplete(sprint)}
                  className="rounded p-1 text-zinc-600 transition-colors hover:text-indigo-400"
                >
                  <IconCheck size={13} />
                </button>
              )}
              {sprint.status !== "COMPLETED" && (
                <button
                  title="Edit sprint"
                  onClick={() => onEdit(sprint)}
                  className="rounded p-1 text-zinc-600 transition-colors hover:text-white"
                >
                  <IconPencil size={13} />
                </button>
              )}
              {sprint.status === "PLANNING" && (
                <button
                  title="Delete sprint"
                  onClick={() => onDelete(sprint)}
                  className="rounded p-1 text-zinc-600 transition-colors hover:text-red-400"
                >
                  <IconTrash size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {sprint.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sprint.tags.map((tag: any) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500"
            >
              <IconTag size={9} />#{tag}
            </span>
          ))}
        </div>
      )}

      {/* Dates row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <IconCalendar size={11} />
          <span className="font-mono text-[10px]">
            {format(parseISO(sprint.startDate), "MMM d")}
            {sprint.endDate &&
              ` → ${format(parseISO(sprint.endDate), "MMM d, yyyy")}`}
          </span>
        </div>
        {sprint.expectedDuration && (
          <span className="font-mono text-[10px] text-zinc-700">
            ~{sprint.expectedDuration}
          </span>
        )}
        {isOverdue && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-red-400">
            <IconAlertTriangle size={10} /> {Math.abs(daysLeft!)}d overdue
          </span>
        )}
        {isUrgent && !isOverdue && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400">
            <IconAlertTriangle size={10} /> {daysLeft}d left
          </span>
        )}
      </div>

      {/* Progress */}
      {sprint.issueCount > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-600">
              Progress
            </span>
            <span className="font-mono text-[10px] text-zinc-600">
              {sprint.doneCount}/{sprint.issueCount} issues
            </span>
          </div>
          <ProgressBar
            done={sprint.doneCount}
            total={sprint.issueCount}
            color={accent}
          />
        </div>
      )}

      {/* Leads + Members footer */}
      <div className="flex items-center justify-between border-t border-white/4 pt-3">
        <div className="flex items-center gap-3">
          {sprint.leads.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-zinc-700">Leads</span>
              <AvatarStack people={sprint.leads} />
            </div>
          )}
          {sprint.members.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-zinc-700">
                Members
              </span>
              <AvatarStack people={sprint.members} />
            </div>
          )}
          {allMembers.length === 0 && (
            <span className="font-mono text-[10px] text-zinc-700 italic">
              No members assigned
            </span>
          )}
        </div>
        <span
          className="font-mono text-[10px]"
          style={{ color: `${accent}80` }}
        >
          {formatDistanceToNow(parseISO(sprint.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};
