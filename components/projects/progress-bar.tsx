export const ProgressBar = ({
  done,
  total,
  color,
}: {
  done: number;
  total: number;
  color: string;
}) => {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/6">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="shrink-0 font-mono text-[10px] text-zinc-600">
        {pct}%
      </span>
    </div>
  );
};
