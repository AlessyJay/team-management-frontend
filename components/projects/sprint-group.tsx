import { Sprint } from "@/types/sprint.types";
import { SprintCard } from "./sprint-card";

export const SprintGroup = ({
  title,
  color,
  sprints,
  projectId,
  isManager,
  onEdit,
  onDelete,
  onStart,
  onComplete,
}: {
  title: string;
  color: string;
  sprints: Sprint[];
  projectId: string;
  isManager: boolean;
  onEdit: (s: Sprint) => void;
  onDelete: (s: Sprint) => void;
  onStart: (s: Sprint) => void;
  onComplete: (s: Sprint) => void;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h2 className="font-mono text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          {title}
        </h2>
        <span className="font-mono text-[10px] text-zinc-700">
          {sprints.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sprints.map((s) => (
          <SprintCard
            key={s.id}
            sprint={s}
            projectId={projectId}
            isManager={isManager}
            onEdit={onEdit}
            onDelete={onDelete}
            onStart={onStart}
            onComplete={onComplete}
          />
        ))}
      </div>
    </div>
  );
};
