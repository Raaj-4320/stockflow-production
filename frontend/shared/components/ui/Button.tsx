"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "subtle";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--btn-bg)] text-[var(--btn-text)] hover:bg-[var(--btn-bg-hover)] active:scale-[0.98]",
  secondary:
    "glass text-text hover:bg-[var(--surface-hover)] active:scale-[0.98]",
  ghost:
    "text-secondary hover:text-text hover:bg-[var(--surface-hover)] active:scale-[0.98]",
  outline:
    "border border-[var(--border-strong)] text-text hover:bg-[var(--surface-hover)] active:scale-[0.98]",
  subtle:
    "bg-[var(--surface)] text-text hover:bg-[var(--surface-hover)] active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  xs: "h-6 px-2 text-xs gap-1 rounded-sm",
  sm: "h-8 px-3 text-sm gap-1.5 rounded-md",
  md: "h-9 px-4 text-sm gap-2 rounded-md",
  lg: "h-11 px-5 text-md gap-2 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    disabled,
    children,
    className,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center font-medium select-none transition-all duration-150",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        isDisabled && "opacity-50 cursor-not-allowed active:scale-100",
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {!loading && rightIcon && <span className="shrink-0 inline-flex">{rightIcon}</span>}
    </button>
  );
});
