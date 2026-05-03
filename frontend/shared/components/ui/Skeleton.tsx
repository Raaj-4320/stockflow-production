import { clsx } from "clsx";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

const roundedMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({
  width,
  height,
  rounded = "md",
  className,
}: SkeletonProps) {
  return (
    <div
      className={clsx(
        "bg-[var(--surface-active)] animate-pulse",
        roundedMap[rounded],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="panel p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton width={160} height={16} />
          <Skeleton width={100} height={13} />
        </div>
        <Skeleton width={60} height={22} rounded="full" />
      </div>
      <div className="flex items-center gap-6">
        <Skeleton width={80} height={13} />
        <Skeleton width={60} height={13} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-subtle">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height={14} className="w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
