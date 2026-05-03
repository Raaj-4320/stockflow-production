"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface AutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  options: string[]; // saved values
  label?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  size?: "sm" | "md";
  allowCreate?: boolean; // suggest "Add as new …" when no exact match
  autoFocus?: boolean;
}

const heightMap = {
  sm: "h-8 text-sm",
  md: "h-9 text-sm",
};

/**
 * Levenshtein-based fuzzy match scorer (0..1, higher = better match).
 * Cheap enough for short option lists like party names.
 */
function levSim(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0 || n === 0) return 0;
  if (Math.abs(m - n) > Math.max(3, Math.floor(Math.max(m, n) * 0.5))) return 0;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return 1 - dp[m][n] / Math.max(m, n);
}

function fuzzyScore(query: string, target: string): number {
  if (!query) return 1;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  // Direct substring/prefix match
  if (t.includes(q)) {
    return t.startsWith(q) ? 1 : 0.9 - t.indexOf(q) * 0.01;
  }
  // Token-level fuzzy — match query against any whitespace-separated word
  const tokens = t.split(/\s+/).filter(Boolean);
  let best = 0;
  for (const tok of tokens) {
    if (tok.startsWith(q)) best = Math.max(best, 0.85);
    const sim = levSim(q, tok);
    if (sim > best) best = sim;
  }
  // Also score against the full target (catches missing-letter typos in long strings)
  best = Math.max(best, levSim(q, t));
  // Threshold: require at least ~0.55 similarity
  return best >= 0.55 ? best * 0.7 : 0;
}

export function Autocomplete({
  value,
  onChange,
  options,
  label,
  placeholder = "Type to search…",
  required,
  hint,
  error,
  className,
  size = "md",
  allowCreate = true,
  autoFocus,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ranked = useMemo(() => {
    const q = value.trim();
    if (!q) {
      // unsorted, show saved as-is
      return options.map((o) => ({ value: o, score: 1, kind: "saved" as const }));
    }
    const exact = options.find((o) => o.toLowerCase() === q.toLowerCase());
    const scored = options
      .map((o) => ({ value: o, score: fuzzyScore(q, o), kind: "saved" as const }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    if (!exact && allowCreate && q.length > 0) {
      scored.push({ value: q, score: 0, kind: "create" as const });
    }
    return scored;
  }, [options, value, allowCreate]);

  useEffect(() => {
    if (!open) return;
    setActiveIdx(0);
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, ranked.length]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(ranked.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      if (open && ranked[activeIdx]) {
        e.preventDefault();
        onChange(ranked[activeIdx].value);
        setOpen(false);
      }
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={clsx("flex flex-col gap-1.5", className)}
      onKeyDown={onKey}
    >
      {label && (
        <label className="text-sm font-medium text-secondary">
          {label}
          {required && <span className="ml-0.5 opacity-60">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={clsx(
            "input-base pr-9 w-full",
            heightMap[size],
            error && "border-[var(--negative)]"
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setOpen((o) => !o);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm text-muted hover:text-text"
          aria-label="Toggle suggestions"
        >
          <ChevronDown
            size={14}
            className={clsx("transition-transform", open && "rotate-180")}
          />
        </button>

        {open && ranked.length > 0 && (
          <div
            role="listbox"
            className="absolute z-40 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-md p-1 shadow-lg bg-bg-elevated border border-[var(--border-strong)] animate-fade-in"
          >
            {ranked.map((it, i) => {
              const isAct = i === activeIdx;
              const isCreate = it.kind === "create";
              return (
                <button
                  key={`${it.kind}-${it.value}`}
                  role="option"
                  type="button"
                  aria-selected={isAct}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => {
                    onChange(it.value);
                    setOpen(false);
                    inputRef.current?.focus();
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-sm text-left transition-colors",
                    isAct ? "bg-[var(--surface-hover)]" : ""
                  )}
                >
                  {isCreate ? (
                    <>
                      <Plus size={13} className="text-[var(--positive)] shrink-0" />
                      <span className="truncate">
                        Add as new — <span className="font-medium">{it.value}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      {value && it.score < 0.9 ? (
                        <Sparkles
                          size={12}
                          className="text-[var(--warning)] shrink-0"
                        />
                      ) : (
                        <span className="w-3 h-3 shrink-0" />
                      )}
                      <span className="truncate flex-1">{it.value}</span>
                      {value && it.score < 0.9 && (
                        <span className="text-2xs text-muted">similar</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
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
