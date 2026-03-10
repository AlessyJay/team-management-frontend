export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="font-mono text-xs font-semibold tracking-[0.12em] text-zinc-400 uppercase">
          {title}
        </h2>
        {subtitle && (
          <span className="font-mono text-[10px] text-zinc-700">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
