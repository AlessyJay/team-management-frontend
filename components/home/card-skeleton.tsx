import { Skeleton } from "../ui/skeleton";

export function CardSkeleton() {
  return (
    <div
      className="space-y-3 rounded-xl border border-white/[0.07] p-5"
      style={{
        background: "var(--card)",
        borderLeftWidth: "3px",
        borderLeftColor: "rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex justify-between">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="border-t border-white/4 pt-2">
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}
