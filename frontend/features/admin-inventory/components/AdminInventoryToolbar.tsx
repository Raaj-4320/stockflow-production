"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";
import { Dropdown } from "../../../shared/components/ui/Dropdown";
import type { SortKey } from "../types";

interface ToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  selectedCount: number;
  onBulkAction: (a: "stock" | "price" | "export" | "delete") => void;
  onMoreFilters: () => void;
}

export function AdminInventoryToolbar({
  search,
  onSearch,
  sort,
  onSort,
  selectedCount,
  onBulkAction,
  onMoreFilters,
}: ToolbarProps) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const bulkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bulkOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!bulkRef.current?.contains(e.target as Node)) setBulkOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBulkOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [bulkOpen]);

  const wrap = (a: "stock" | "price" | "export" | "delete") => () => {
    onBulkAction(a);
    setBulkOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2.5">
      <Input
        leftElement={<Search size={14} />}
        placeholder="Search by product name or SKU…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1"
      />
      <div className="flex items-center gap-2">
        <Dropdown<SortKey>
          value={sort}
          onChange={onSort}
          className="w-44"
          options={[
            { value: "recent", label: "Sort By: Recent" },
            { value: "name_asc", label: "Name A→Z" },
            { value: "name_desc", label: "Name Z→A" },
            { value: "stock_desc", label: "Stock: High → Low" },
            { value: "stock_asc", label: "Stock: Low → High" },
            { value: "value_desc", label: "Value: High → Low" },
          ]}
        />

        {/* Bulk Actions popover */}
        <div ref={bulkRef} className="relative">
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => setBulkOpen((o) => !o)}
            className="input-base h-9 px-3 inline-flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Bulk Actions</span>
            {selectedCount > 0 && (
              <span className="px-1.5 py-0.5 text-2xs font-semibold rounded bg-text text-bg">
                {selectedCount}
              </span>
            )}
            <ChevronDown
              size={14}
              className={`text-muted transition-transform ${
                bulkOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {bulkOpen && selectedCount > 0 && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 z-40 w-44 rounded-md p-1 shadow-lg bg-bg-elevated border border-[var(--border-strong)] animate-fade-in"
            >
              <BulkItem onClick={wrap("stock")}>Update Stock</BulkItem>
              <BulkItem onClick={wrap("price")}>Update Price</BulkItem>
              <BulkItem onClick={wrap("export")}>Export Selected</BulkItem>
              <div className="my-1 h-px bg-[var(--border)]" />
              <BulkItem
                onClick={wrap("delete")}
                className="text-[var(--negative)]"
              >
                Delete Selected
              </BulkItem>
            </div>
          )}
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={onMoreFilters}
          leftIcon={<SlidersHorizontal size={13} />}
        >
          Filters
        </Button>
      </div>
    </div>
  );
}

function BulkItem({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2.5 py-1.5 rounded-sm text-sm hover:bg-surface-hover transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
