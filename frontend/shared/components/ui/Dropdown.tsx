"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export interface DropdownOption<V extends string = string> {
  value: V;
  label: string;
  hint?: string;
  disabled?: boolean;
}

interface DropdownProps<V extends string = string> {
  value: V;
  onChange: (v: V) => void;
  options: DropdownOption<V>[];
  label?: string;
  placeholder?: string;
  size?: "sm" | "md";
  align?: "left" | "right";
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  required?: boolean;
}

const heightMap = {
  sm: "h-8 text-sm",
  md: "h-9 text-sm",
};

export function Dropdown<V extends string = string>({
  value,
  onChange,
  options,
  label,
  placeholder = "Select…",
  size = "md",
  align = "left",
  className,
  disabled,
  fullWidth,
  required,
}: DropdownProps<V>) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setActiveIdx(idx >= 0 ? idx : 0);
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, options, value]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIdx];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        setOpen(false);
      }
    }
  };

  return (
    <div
      ref={wrapRef}
      className={clsx("flex flex-col gap-1.5", fullWidth ? "w-full" : "", className)}
      onKeyDown={onKey}
    >
      {label && (
        <label className="text-sm font-medium text-secondary">
          {label}
          {required && <span className="ml-0.5 opacity-60">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            "input-base inline-flex items-center justify-between gap-2 cursor-pointer w-full text-left",
            heightMap[size],
            disabled && "opacity-50 cursor-not-allowed",
            open && "border-text"
          )}
        >
          <span className={current ? "" : "text-muted"}>
            {current?.label ?? placeholder}
          </span>
          <ChevronDown
            size={14}
            className={clsx(
              "text-muted shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div
            role="listbox"
            className={clsx(
              "absolute z-40 mt-1 min-w-full max-h-64 overflow-y-auto rounded-md p-1 shadow-lg",
              "bg-bg-elevated border border-[var(--border-strong)] animate-fade-in",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {options.map((opt, i) => {
              const isSel = opt.value === value;
              const isAct = i === activeIdx;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={isSel}
                  disabled={opt.disabled}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-sm text-sm text-left transition-colors",
                    isAct
                      ? "bg-[var(--surface-hover)] text-text"
                      : "text-text",
                    opt.disabled && "opacity-40 cursor-not-allowed",
                    isSel && "font-medium"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {opt.hint && (
                      <span className="text-xs text-muted">{opt.hint}</span>
                    )}
                    {isSel && <Check size={13} className="text-[var(--positive)]" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
