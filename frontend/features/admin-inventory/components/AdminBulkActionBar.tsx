"use client";

import { CheckCircle2, RefreshCw, Tag, Download, Trash2, X } from "lucide-react";

interface BulkBarProps {
  count: number;
  onUpdateStock: () => void;
  onUpdatePrice: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function AdminBulkActionBar({
  count,
  onUpdateStock,
  onUpdatePrice,
  onExport,
  onDelete,
  onClear,
}: BulkBarProps) {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 mb-3 rounded-md bg-[var(--positive-bg)] ring-1 ring-[var(--positive-border)] animate-fade-in">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--positive)]">
        <CheckCircle2 size={14} />
        <span>{count} product{count === 1 ? "" : "s"} selected</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 ml-auto">
        <BarBtn icon={<RefreshCw size={13} />} onClick={onUpdateStock}>
          Update Stock
        </BarBtn>
        <BarBtn icon={<Tag size={13} />} onClick={onUpdatePrice}>
          Update Price
        </BarBtn>
        <BarBtn icon={<Download size={13} />} onClick={onExport}>
          Export Selected
        </BarBtn>
        <BarBtn
          icon={<Trash2 size={13} />}
          onClick={onDelete}
          className="text-[var(--negative)] hover:bg-[var(--negative-bg)]"
        >
          Delete Selected
        </BarBtn>
        <button
          onClick={onClear}
          className="ml-1 p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover"
          title="Clear selection"
          aria-label="Clear selection"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function BarBtn({
  icon,
  children,
  onClick,
  className = "",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-sm text-sm font-medium text-text hover:bg-surface-hover transition-colors ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
