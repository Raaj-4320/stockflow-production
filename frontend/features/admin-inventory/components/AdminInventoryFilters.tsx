"use client";

import type { Category, StockState } from "../types";

interface FiltersProps {
  categories: Category[];
  totalCount: number;
  activeCategory: string;
  onCategory: (name: string) => void;
  stockOverview: { in_stock: number; low_stock: number; out_of_stock: number };
  activeStock: StockState[];
  onToggleStock: (s: StockState) => void;
}

export function AdminInventoryFilters({
  categories,
  totalCount,
  activeCategory,
  onCategory,
  stockOverview,
  activeStock,
  onToggleStock,
}: FiltersProps) {
  return (
    <div className="space-y-4">
      <div className="panel p-3">
        <div className="text-2xs uppercase tracking-wider text-muted font-medium px-1.5 mb-2">
          Categories
        </div>
        <ul className="space-y-0.5">
          <CategoryItem
            label="All Categories"
            count={totalCount}
            active={activeCategory === "all"}
            onClick={() => onCategory("all")}
          />
          {categories.map((c) => (
            <CategoryItem
              key={c.id}
              label={c.name}
              count={c.productCount}
              active={activeCategory === c.name}
              onClick={() => onCategory(c.name)}
            />
          ))}
        </ul>
      </div>

      <div className="panel p-3">
        <div className="text-2xs uppercase tracking-wider text-muted font-medium px-1.5 mb-2">
          Stock Overview
        </div>
        <ul className="space-y-1">
          <StockRow
            label="In Stock"
            count={stockOverview.in_stock}
            tone="positive"
            active={activeStock.includes("in_stock")}
            onClick={() => onToggleStock("in_stock")}
          />
          <StockRow
            label="Low Stock"
            count={stockOverview.low_stock}
            tone="warning"
            active={activeStock.includes("low_stock")}
            onClick={() => onToggleStock("low_stock")}
          />
          <StockRow
            label="Out of Stock"
            count={stockOverview.out_of_stock}
            tone="negative"
            active={activeStock.includes("out_of_stock")}
            onClick={() => onToggleStock("out_of_stock")}
          />
        </ul>
      </div>
    </div>
  );
}

function CategoryItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors ${
          active
            ? "bg-surface-active text-text font-medium"
            : "text-secondary hover:text-text hover:bg-surface-hover"
        }`}
      >
        <span className="truncate">{label}</span>
        <span className={`text-xs ${active ? "text-text" : "text-muted"}`}>
          {count}
        </span>
      </button>
    </li>
  );
}

function StockRow({
  label,
  count,
  tone,
  active,
  onClick,
}: {
  label: string;
  count: number;
  tone: "positive" | "warning" | "negative";
  active: boolean;
  onClick: () => void;
}) {
  const dot =
    tone === "positive"
      ? "bg-[var(--positive)]"
      : tone === "warning"
      ? "bg-[var(--warning)]"
      : "bg-[var(--negative)]";
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors ${
          active
            ? "bg-surface-active text-text font-medium"
            : "text-secondary hover:text-text hover:bg-surface-hover"
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          {label}
        </span>
        <span className={`text-xs ${active ? "text-text" : "text-muted"}`}>
          {count}
        </span>
      </button>
    </li>
  );
}
