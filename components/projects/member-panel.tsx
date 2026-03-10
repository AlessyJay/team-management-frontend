import { ProjectMember } from "@/types/home.types";
import { formatDistanceToNow, parseISO } from "date-fns";

const Group = ({
  title,
  people,
  ownerId,
}: {
  title: string;
  people: ProjectMember[];
  ownerId: string;
}) =>
  people.length === 0 ? null : (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        {people.map((m) => (
          <div
            key={m.userId}
            className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 px-4 py-3 transition-colors hover:border-white/10"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-xs font-bold text-white">
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm text-white">
                {m.name}
                {m.userId === ownerId && (
                  <span className="ml-2 font-mono text-[10px] text-zinc-600">
                    owner
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-zinc-600">{m.email}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="font-mono text-[10px] text-zinc-700">
                Joined{" "}
                {formatDistanceToNow(parseISO(m.joinedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

export const MembersPanel = ({
  members,
  ownerId,
}: {
  members: ProjectMember[];
  ownerId: string;
}) => {
  const managers = members.filter((m) => m.role === "MANAGER");
  const regular = members.filter((m) => m.role === "MEMBER");

  return (
    <div className="flex flex-col gap-6">
      <Group title="Managers" people={managers} ownerId={ownerId} />
      <Group title="Members" people={regular} ownerId={ownerId} />
    </div>
  );
};
