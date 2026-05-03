"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dropdown } from "../../../shared/components/ui/Dropdown";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (n: number) => void;
  onPageSizeChange: (n: number) => void;
}

function pageRange(page: number, totalPages: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const push = (v: number | "…") => out.push(v);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
    return out;
  }
  push(1);
  if (page > 3) push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) push(i);
  if (page < totalPages - 2) push("…");
  push(totalPages);
  return out;
}

export function InventoryPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const items = pageRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-subtle">
      <div className="text-xs text-muted">
        Showing {start} to {end} of {total} products
      </div>
      <div className="flex items-center gap-1.5">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
        {items.map((it, i) =>
          it === "…" ? (
            <span key={`e${i}`} className="text-muted text-xs px-1">
              …
            </span>
          ) : (
            <button
              key={it}
              onClick={() => onPageChange(it)}
              className={`min-w-[28px] h-7 px-2 rounded-sm text-xs font-medium transition-colors ${
                it === page
                  ? "bg-[var(--positive)] text-white"
                  : "text-secondary hover:text-text hover:bg-surface-hover"
              }`}
            >
              {it}
            </button>
          )
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
        <Dropdown<string>
          value={String(pageSize)}
          onChange={(v) => onPageSizeChange(Number(v))}
          align="right"
          size="sm"
          className="w-32 ml-2"
          options={[
            { value: "12", label: "12 / page" },
            { value: "24", label: "24 / page" },
            { value: "48", label: "48 / page" },
            { value: "96", label: "96 / page" },
          ]}
        />
      </div>
    </div>
  );
}
