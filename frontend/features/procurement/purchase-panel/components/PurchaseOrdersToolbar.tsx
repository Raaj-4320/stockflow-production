"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Plus, Upload, Download, SlidersHorizontal, X } from "lucide-react";
import { clsx } from "clsx";
import type { OrderFilters, OrderStatus } from "../types";
import { Button } from "../../../../shared/components/ui/Button";
import { Input, Select } from "../../../../shared/components/ui/Input";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "ordered", label: "Ordered" },
  { value: "partially_received", label: "Partially Received" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
  { value: "totalAmount_desc", label: "Highest Amount" },
  { value: "totalAmount_asc", label: "Lowest Amount" },
  { value: "partyName_asc", label: "Party A–Z" },
];

interface PurchaseOrdersToolbarProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  total: number;
  onCreateOrder: () => void;
  onImport: () => void;
  onDownload: () => void;
}

export function PurchaseOrdersToolbar({
  filters,
  onFiltersChange,
  total,
  onCreateOrder,
  onImport,
  onDownload,
}: PurchaseOrdersToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchInput });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("_");
    onFiltersChange({
      ...filters,
      sortField: field as OrderFilters["sortField"],
      sortDirection: direction as OrderFilters["sortDirection"],
    });
  };

  const currentSort = `${filters.sortField}_${filters.sortDirection}`;
  const hasActiveFilters =
    filters.search || filters.status !== "all";

  const clearFilters = () => {
    setSearchInput("");
    onFiltersChange({
      ...filters,
      search: "",
      status: "all",
    });
  };

  return (
    <div className="space-y-3">
      {/* Primary row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-xs">
          <Input
            placeholder="Search orders or parties…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftElement={<Search size={14} />}
            rightElement={
              searchInput ? (
                <button
                  onClick={() => setSearchInput("")}
                  className="hover:text-text-primary"
                >
                  <X size={13} />
                </button>
              ) : null
            }
          />
        </div>

        {/* Status filter */}
        <div className="min-w-[140px]">
          <Select
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value as OrderStatus | "all",
              })
            }
          />
        </div>

        {/* Sort */}
        <div className="min-w-[160px] hidden sm:block">
          <Select
            options={SORT_OPTIONS}
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="md"
            leftIcon={<Download size={14} />}
            onClick={onDownload}
            className="hidden sm:inline-flex"
          >
            Export
          </Button>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Upload size={14} />}
            onClick={onImport}
          >
            Import
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={14} />}
            onClick={onCreateOrder}
          >
            New Order
          </Button>
        </div>
      </div>

      {/* Active filters row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <SlidersHorizontal size={12} />
          <span>
            Showing {total} result{total !== 1 ? "s" : ""}
          </span>
          <button
            onClick={clearFilters}
            className="ml-1 flex items-center gap-1 text-accent hover:underline"
          >
            <X size={11} />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
