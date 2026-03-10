import { Projects } from "@/types/home.types";
import { getAccent } from "./get-accent";
import { urgentReason } from "./get-urgent";
import { formatDistanceToNow, parseISO } from "date-fns";

export const ProjectCard = ({
  item,
  compact = false,
  onClick,
}: {
  item: Projects;
  compact?: boolean;
  onClick: (id: string) => void;
}) => {
  const accent = getAccent(item.name);
  const initial = item.name.charAt(0).toUpperCase();
  const isActive = item.status === "ACTIVE";
  const isArchived = item.status === "ARCHIVED";
  const reason = urgentReason(item);

  const relativeDate = item.createdAt
    ? formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })
    : null;

  return (
    <div
      onClick={() => onClick(item.id)}
      className="group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-xl border p-5 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${accent.bg} 0%, transparent 60%), var(--card)`,
        borderColor: "rgba(255,255,255,0.07)",
        borderLeftColor: accent.color,
        borderLeftWidth: "3px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = `0 0 0 1px ${accent.glow}, 0 8px 32px ${accent.glow}`;
        el.style.borderColor = `${accent.color}55`;
        el.style.borderLeftColor = accent.color;
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "none";
        el.style.borderColor = "rgba(255,255,255,0.07)";
        el.style.borderLeftColor = accent.color;
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Watermark */}
      <span
        className="pointer-events-none absolute -top-3 -right-2 font-mono leading-none font-black opacity-[0.04] transition-opacity duration-300 select-none group-hover:opacity-[0.07]"
        style={{ fontSize: "7rem", color: accent.color }}
        aria-hidden
      >
        {initial}
      </span>

      {/* Name + status */}
      <div className="flex items-start justify-between gap-3 pr-6">
        <h2 className="line-clamp-2 font-mono text-sm leading-snug font-semibold tracking-tight text-white">
          {item.name}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">
          {isActive && (
            <span className="relative flex size-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: accent.color }}
              />
              <span
                className="relative inline-flex size-1.5 rounded-full"
                style={{ backgroundColor: accent.color }}
              />
            </span>
          )}
          <span
            className="font-mono text-[10px] font-medium tracking-widest uppercase"
            style={{
              color: isActive
                ? accent.color
                : isArchived
                  ? "var(--muted-foreground)"
                  : "#f59e0b",
            }}
          >
            {item.status}
          </span>
        </div>
      </div>

      {/* Urgent badge */}
      {reason && (
        <div className="flex items-center gap-1.5">
          <span className="rounded-md border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-red-400">
            ⚡ {reason}
          </span>
        </div>
      )}

      {/* Description */}
      {!compact &&
        (item.description ? (
          <p className="line-clamp-2 font-mono text-xs leading-relaxed text-zinc-500">
            {item.description}
          </p>
        ) : (
          <p className="font-mono text-xs text-zinc-700 italic">
            No description
          </p>
        ))}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-white/4 pt-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-zinc-600">
            {relativeDate ?? "—"}
          </span>
          <span className="font-mono text-[10px] text-zinc-700">
            {item.memberCount} member{item.memberCount !== 1 ? "s" : ""}
          </span>
          {item.activeSprint && (
            <span
              className="font-mono text-[10px]"
              style={{ color: accent.color }}
            >
              {item.activeSprint.name}
            </span>
          )}
        </div>
        <span
          className="font-mono text-xs opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
          style={{ color: accent.color }}
        >
          →
        </span>
      </div>
    </div>
  );
};
