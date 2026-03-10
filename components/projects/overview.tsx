import { parseISO, format } from "date-fns";
import { ProgressBar } from "./progress-bar";
import { getAccent } from "./get-accents";
import { ProjectMember, Projects } from "@/types/home.types";
import { Sprint } from "@/types/sprint.types";

const Stat = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) => (
  <div className="flex flex-col gap-1 rounded-xl border border-white/[0.07] bg-white/2 p-4">
    <span className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
      {label}
    </span>
    <span className="font-mono text-2xl font-bold text-white">{value}</span>
    {sub && <span className="font-mono text-[10px] text-zinc-700">{sub}</span>}
  </div>
);

export const OverviewPanel = ({
  project,
  sprints,
  members,
}: {
  project: Projects;
  sprints: Sprint[];
  members: ProjectMember[];
}) => {
  const active = sprints.find((s) => s.status === "ACTIVE");
  const planning = sprints.filter((s) => s.status === "PLANNING").length;
  const completed = sprints.filter((s) => s.status === "COMPLETED").length;
  const accent = getAccent(project.name);

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Members" value={members.length} />
        <Stat
          label="Sprints"
          value={sprints.length}
          sub={`${planning} planning · ${completed} done`}
        />
        <Stat label="Active" value={active ? "1" : "—"} sub={active?.name} />
        <Stat
          label="Issues"
          value={sprints.reduce((a, s) => a + s.issueCount, 0)}
          sub={`${sprints.reduce((a, s) => a + s.doneCount, 0)} done`}
        />
      </div>

      {/* Active sprint spotlight */}
      {active && (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
            Active Sprint
          </p>
          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: `${accent}30`,
              background: `linear-gradient(135deg, ${accent}08 0%, transparent 60%)`,
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex size-1.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ backgroundColor: "#10b981" }}
                  />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-sm font-semibold text-white">
                  {active.name}
                </span>
                {active.category && (
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                    style={{
                      color: accent,
                      backgroundColor: `${accent}15`,
                    }}
                  >
                    {active.category}
                  </span>
                )}
              </div>
              {active.endDate && (
                <span className="font-mono text-[10px] text-zinc-600">
                  ends {format(parseISO(active.endDate), "MMM d, yyyy")}
                </span>
              )}
            </div>
            {active.goal && (
              <p className="mb-3 font-mono text-xs text-zinc-500">
                {active.goal}
              </p>
            )}
            {active.issueCount > 0 && (
              <ProgressBar
                done={active.doneCount}
                total={active.issueCount}
                color={accent}
              />
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
            About
          </p>
          <p className="font-mono text-sm leading-relaxed text-zinc-400">
            {project.description}
          </p>
        </div>
      )}
    </div>
  );
};
