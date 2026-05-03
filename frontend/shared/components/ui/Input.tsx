"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

// ─── Text Input ─────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

const heightMap = {
  sm: "h-8 text-sm",
  md: "h-9 text-sm",
  lg: "h-11 text-md",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftElement,
    rightElement,
    inputSize = "md",
    className,
    id,
    ...rest
  },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const padLeft = leftElement ? "pl-9" : "pl-3";
  const padRight = rightElement ? "pr-9" : "pr-3";

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-secondary"
        >
          {label}
          {rest.required && (
            <span className="ml-0.5 opacity-60" aria-hidden>*</span>
          )}
        </label>
      )}
      <div className="relative">
        {leftElement && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">
            {leftElement}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "input-base",
            heightMap[inputSize],
            padLeft,
            padRight,
            error && "border-[var(--negative)] focus:border-[var(--negative)]"
          )}
          {...rest}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-[var(--negative)]" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
});

// ─── Select ─────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  inputSize?: "sm" | "md" | "lg";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    hint,
    options,
    placeholder,
    inputSize = "md",
    className,
    id,
    ...rest
  },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            "input-base appearance-none cursor-pointer pr-9",
            heightMap[inputSize]
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-[var(--negative)]">{error}</p>}
      {!error && hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
});

// ─── Textarea ───────────────────────────────────────────────────────────────

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...rest }, ref) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx("input-base py-2 resize-y min-h-[80px] text-sm")}
          {...rest}
        />
        {error && <p className="text-xs text-[var(--negative)]">{error}</p>}
        {!error && hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);
