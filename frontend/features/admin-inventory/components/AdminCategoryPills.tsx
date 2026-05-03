"use client";

import type { Category } from "../types";

interface PillsProps {
  categories: Category[];
  totalCount: number;
  active: string;
  onSelect: (name: string) => void;
}

export function AdminCategoryPills({
  categories,
  totalCount,
  active,
  onSelect,
}: PillsProps) {
  const items = [
    { id: "all", name: "All Categories", count: totalCount },
    ...categories.map((c) => ({ id: c.id, name: c.name, count: c.productCount })),
  ];

  return (
    <div className="overflow-x-auto no-scrollbar -mx-1">
      <div className="flex items-center gap-1.5 px-1 min-w-max">
        {items.map((it) => {
          const isActive =
            (it.id === "all" && active === "all") || it.name === active;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id === "all" ? "all" : it.name)}
              className={`inline-flex items-center gap-2 h-8 px-3 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                isActive
                  ? "bg-text text-bg border-text"
                  : "bg-[var(--surface)] text-secondary border-subtle hover:text-text hover:border-[var(--border-strong)]"
              }`}
            >
              <span>{it.name}</span>
              <span
                className={`text-2xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive
                    ? "bg-bg/20 text-bg"
                    : "bg-[var(--surface-active)] text-muted"
                }`}
              >
                {it.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
