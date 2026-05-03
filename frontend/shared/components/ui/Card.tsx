import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const padMap = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function Card({
  children,
  className,
  glass = true,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={clsx(
        glass ? "panel" : "panel-flat",
        padMap[padding],
        hover && "glass-hover hover:-translate-y-0.5 transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-start justify-between gap-4 pb-3 mb-4 border-b border-subtle",
        className
      )}
    >
      <div className="min-w-0">
        {typeof title === "string" ? (
          <h3 className="text-md font-semibold tracking-tight truncate">
            {title}
          </h3>
        ) : (
          title
        )}
        {subtitle && (
          <p className="text-sm text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-end gap-2 pt-3 mt-4 border-t border-subtle",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "px-4 sm:px-5 py-4 border-b border-subtle last:border-0",
        className
      )}
    >
      {children}
    </div>
  );
}
