// Reusable skeleton loading components — matches project's glassmorphic card style

export function SkeletonCard() {
  return (
    <div className="rounded-[40px] overflow-hidden bg-white/70 dark:bg-slate-900/70 border border-border backdrop-blur-xl">
      <div className="h-44 w-full bg-slate-200 dark:bg-white/5 animate-pulse" />
      <div className="p-7 space-y-4">
        <div className="h-3 w-16 rounded-full bg-slate-200 dark:bg-white/5 animate-pulse" />
        <div className="h-5 w-full rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
        <div className="h-4 w-3/4 rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
        <div className="h-3 w-1/2 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse" />
        <div className="h-12 w-full mt-2 rounded-[20px] bg-slate-200 dark:bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-[32px] p-6 bg-white/70 dark:bg-slate-900/70 border border-border backdrop-blur-xl flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl flex-shrink-0 bg-slate-200 dark:bg-white/5 animate-pulse" />
      <div className="flex-1 space-y-2.5">
        <div className="h-3 w-20 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse" />
        <div className="h-6 w-12 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="rounded-2xl px-5 py-4 bg-slate-50 dark:bg-white/5 border border-border flex justify-between items-center">
      <div className="h-4 w-48 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse" />
      <div className="h-3 w-16 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }) {
  const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };
  return (
    <div
      className={`rounded-full bg-slate-200 dark:bg-white/5 animate-pulse ${sizes[size]}`}
    />
  );
}

export function SkeletonContentGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="h-[420px] rounded-[48px] bg-slate-200 dark:bg-white/5 animate-pulse border border-border/50"
          />
        ))}
    </div>
  );
}

