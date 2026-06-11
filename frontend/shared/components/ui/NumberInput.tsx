"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
  value: number | "";
  onChange: (n: number) => void;
  /** Allow decimals (default true). Set false for integer-only fields like quantity. */
  allowDecimal?: boolean;
  min?: number;
  max?: number;
}

const heightMap = {
  sm: "h-8 text-sm",
  md: "h-9 text-sm",
  lg: "h-11 text-md",
};

/**
 * Numeric-only input.
 *  - No spinner arrows (handled in globals.css).
 *  - Wheel scroll is BLOCKED (prevents accidental value changes when scrolling
 *    the page over a focused number field).
 *  - Rejects every keystroke that isn't a digit / minus / decimal-point /
 *    navigation key.
 *  - Pasted text is also sanitized.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      label,
      error,
      hint,
      leftElement,
      rightElement,
      inputSize = "md",
      value,
      onChange,
      allowDecimal = true,
      min,
      max,
      className,
      id,
      required,
      ...rest
    },
    ref
  ) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const padLeft = leftElement ? "pl-9" : "pl-3";
    const padRight = rightElement ? "pr-9" : "pr-3";

    const allowedNavKeys = new Set([
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
      "Enter",
      "Escape",
    ]);

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.metaKey || e.ctrlKey) return; // allow copy/paste/select-all
      if (allowedNavKeys.has(e.key)) return;
      if (/^[0-9]$/.test(e.key)) return;
      if (allowDecimal && e.key === ".") {
        if (e.currentTarget.value.includes(".")) e.preventDefault();
        return;
      }
      if (e.key === "-" && (min === undefined || min < 0)) {
        if (e.currentTarget.selectionStart !== 0) e.preventDefault();
        return;
      }
      e.preventDefault();
    };

    const sanitize = (raw: string): string => {
      let s = raw.replace(/[^0-9.\-]/g, "");
      if (!allowDecimal) s = s.replace(/\./g, "");
      // keep only first decimal point
      const firstDot = s.indexOf(".");
      if (firstDot >= 0) {
        s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
      }
      // keep minus only at start
      if (s.length > 1) {
        const head = s[0];
        s = head + s.slice(1).replace(/-/g, "");
      }
      return s;
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const sanitized = sanitize(e.target.value);
      if (sanitized === "" || sanitized === "-" || sanitized === ".") {
        onChange(0);
        return;
      }
      let n = Number(sanitized);
      if (Number.isNaN(n)) return;
      if (min !== undefined && n < min) n = min;
      if (max !== undefined && n > max) n = max;
      onChange(n);
    };

    const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
      const text = e.clipboardData.getData("text");
      const sanitized = sanitize(text);
      if (sanitized !== text) {
        e.preventDefault();
        const n = Number(sanitized);
        if (!Number.isNaN(n)) onChange(n);
      }
    };

    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-secondary"
          >
            {label}
            {required && (
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
            // type="text" + inputMode keeps the mobile numeric keypad while
            // letting US strip every non-numeric keystroke ourselves —
            // no browser spinner, no scroll-wheel value changes.
            type="text"
            inputMode={allowDecimal ? "decimal" : "numeric"}
            value={value === 0 && rest.placeholder ? "" : String(value)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            // Defensive belt-and-braces: even though we don't use type=number,
            // some users may have wheel-zoom etc. Block wheel anyway.
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            className={clsx(
              "input-base nums",
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
  }
);
