export const AvatarStack = ({
  people,
  max = 4,
}: {
  people: { name: string }[];
  max?: number;
}) => {
  const shown = people.slice(0, max);
  const extra = people.length - max;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((p, i) => (
        <div
          key={i}
          className="flex size-5 shrink-0 items-center justify-center rounded-full border border-black/40 bg-zinc-700 font-mono text-[9px] font-bold text-white"
          title={p.name}
        >
          {p.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {extra > 0 && (
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-black/40 bg-zinc-800 font-mono text-[9px] text-zinc-400">
          +{extra}
        </div>
      )}
    </div>
  );
};
