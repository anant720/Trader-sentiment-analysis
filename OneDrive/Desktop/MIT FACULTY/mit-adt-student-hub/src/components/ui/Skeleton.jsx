/** Animated loading skeleton block */
export default function Skeleton({ className = '', style }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
    />
  );
}

/** Grid of 6 faculty card skeletons */
export function FacultyGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-card overflow-hidden shadow-card">
          <Skeleton className="w-full h-28" />
          <div className="p-3 bg-[var(--color-surface)] flex flex-col gap-2">
            <Skeleton className="h-3.5 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
