import { clsx } from "clsx";

type Tone = "default" | "subtle" | "outline" | "solid" | "positive" | "negative";

interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const toneMap: Record<Tone, string> = {
  default:
    "bg-[var(--surface)] text-text border border-subtle",
  subtle:
    "bg-[var(--surface)] text-secondary border border-subtle",
  outline:
    "border border-[var(--border-strong)] text-text",
  solid:
    "bg-text text-bg",
  // semantic — used sparingly for stock state etc., text only, no full color floods
  positive:
    "border border-subtle text-[var(--positive)]",
  negative:
    "border border-subtle text-[var(--negative)]",
};

const dotMap: Record<Tone, string> = {
  default: "bg-text-muted",
  subtle: "bg-text-muted",
  outline: "bg-text-muted",
  solid: "bg-bg",
  positive: "bg-[var(--positive)]",
  negative: "bg-[var(--negative)]",
};

export function Badge({
  children,
  tone = "default",
  size = "sm",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        toneMap[tone],
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotMap[tone])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  ordered: { label: "Ordered", tone: "subtle" },
  partially_received: { label: "Partial", tone: "outline" },
  received: { label: "Received", tone: "positive" },
  cancelled: { label: "Cancelled", tone: "subtle" },
  in_stock: { label: "In Stock", tone: "positive" },
  low_stock: { label: "Low Stock", tone: "outline" },
  out_of_stock: { label: "Out of Stock", tone: "negative" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const c = STATUS_MAP[status] ?? { label: status, tone: "default" as Tone };
  return (
    <Badge tone={c.tone} dot>
      {c.label}
    </Badge>
  );
}
