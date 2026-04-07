// Reusable skeleton loading components

export function SkeletonCard() {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="skeleton h-44 w-full rounded-none rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-9 w-full mt-2 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="skeleton h-12 w-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-6 w-12" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="card px-4 py-3 flex justify-between items-center">
      <div className="skeleton h-4 w-48" />
      <div className="skeleton h-3 w-16" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }) {
  const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };
  return <div className={`skeleton rounded-full ${sizes[size]}`} />;
}
