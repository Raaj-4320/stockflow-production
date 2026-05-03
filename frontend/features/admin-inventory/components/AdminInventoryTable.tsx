"use client";

import { useEffect, useRef, useState } from "react";
import {
  Package,
  Eye,
  Pencil,
  Trash2,
  ScanLine,
  Plus,
  History,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { fmt } from "../utils/inventoryMetrics";
import type { Product } from "../types";
import { stockStateFor } from "../types";

interface TableProps {
  products: Product[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  onView: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onBarcode: (p: Product) => void;
  onAddPurchase: (p: Product) => void;
  onHistory: (p: Product) => void;
}

const stockChip = (p: Product) => {
  const s = stockStateFor(p);
  const c =
    s === "in_stock"
      ? { dot: "bg-[var(--positive)]", text: "text-[var(--positive)]", label: "In Stock" }
      : s === "low_stock"
      ? { dot: "bg-[var(--warning)]", text: "text-[var(--warning)]", label: "Low Stock" }
      : { dot: "bg-[var(--negative)]", text: "text-[var(--negative)]", label: "Out of Stock" };
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-1.5 w-2 h-2 rounded-full ${c.dot}`} />
      <div>
        <div className="font-semibold nums leading-tight">{p.stock}</div>
        <div className={`text-2xs ${c.text}`}>{c.label}</div>
      </div>
    </div>
  );
};

export function AdminInventoryTable({
  products,
  selectedIds,
  onToggleRow,
  onToggleAll,
  allSelected,
  onView,
  onEdit,
  onDelete,
  onBarcode,
  onAddPurchase,
  onHistory,
}: TableProps) {
  return (
    <div className="overflow-auto max-h-[calc(100vh-360px)] rounded-md">
      <table className="w-full border-collapse min-w-[1100px]">
        <thead className="sticky top-0 z-20 bg-bg-elevated shadow-[0_1px_0_var(--border)]">
          <tr>
            <Th width="36px">
              <Checkbox checked={allSelected} onChange={onToggleAll} />
            </Th>
            <Th width="56px">Image</Th>
            <Th sortable>Product</Th>
            <Th sortable>Category</Th>
            <Th>SKU</Th>
            <Th align="right">Buy/Sell</Th>
            <Th align="left" sortable>Stock</Th>
            <Th align="right">Total Stock Value</Th>
            <Th align="center">Purchase/Sold</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={10} className="py-16 text-center text-muted">
                No products match your filters.
              </td>
            </tr>
          ) : (
            products.map((p) => {
              const selected = selectedIds.has(p.id);
              return (
                <tr
                  key={p.id}
                  className={`border-b border-subtle last:border-0 transition-colors ${
                    selected
                      ? "bg-[var(--positive-bg)]"
                      : "hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <Td>
                    <Checkbox
                      checked={selected}
                      onChange={() => onToggleRow(p.id)}
                    />
                  </Td>
                  <Td>
                    <div className="w-9 h-9 rounded-md bg-surface-active grid place-items-center text-faint">
                      <Package size={14} />
                    </div>
                  </Td>
                  <Td>
                    <div className="min-w-[220px] max-w-[360px]">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted">{p.sku}</div>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone="subtle">{p.category}</Badge>
                  </Td>
                  <Td>
                    <span className="text-secondary nums text-sm">{p.sku}</span>
                  </Td>
                  <Td align="right">
                    <div className="nums">
                      <div>{fmt(p.buyPrice)}</div>
                      <div className="text-xs text-muted">{fmt(p.sellPrice)}</div>
                    </div>
                  </Td>
                  <Td>{stockChip(p)}</Td>
                  <Td align="right">
                    <span className="nums font-medium">
                      {fmt(p.buyPrice * p.stock)}
                    </span>
                  </Td>
                  <Td align="center">
                    <span className="nums text-secondary">
                      {p.totalPurchased ?? p.stock} / {p.totalSold ?? 0}
                    </span>
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<Plus size={12} />}
                        onClick={() => onAddPurchase(p)}
                        className="text-[var(--positive)] border-[var(--positive-border)] hover:bg-[var(--positive-bg)]"
                      >
                        Add Purchase
                      </Button>
                      <RowMenu
                        onView={() => onView(p)}
                        onEdit={() => onEdit(p)}
                        onBarcode={() => onBarcode(p)}
                        onHistory={() => onHistory(p)}
                        onDelete={() => onDelete(p)}
                      />
                    </div>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  width,
  align = "left",
  sortable,
}: {
  children: React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
}) {
  return (
    <th
      style={width ? { width } : undefined}
      className={`px-3 py-3 text-2xs font-medium text-muted uppercase tracking-wider border-b border-subtle whitespace-nowrap ${
        align === "right"
          ? "text-right"
          : align === "center"
          ? "text-center"
          : "text-left"
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-faint">
            <path d="M5 2L8 5H2z" fill="currentColor" />
            <path d="M5 8L2 5h6z" fill="currentColor" opacity="0.4" />
          </svg>
        )}
      </span>
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <td
      className={`px-3 py-3 text-sm text-text align-middle ${
        align === "right"
          ? "text-right"
          : align === "center"
          ? "text-center"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <span
        className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
          checked
            ? "bg-[var(--positive)] border-[var(--positive)]"
            : "border-[var(--border-strong)] hover:border-text"
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-white">
            <path
              d="M2 5L4 7L8 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </span>
    </label>
  );
}

function RowMenu({
  onView,
  onEdit,
  onBarcode,
  onHistory,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onBarcode: () => void;
  onHistory: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const wrap = (fn: () => void) => () => {
    fn();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-40 w-44 rounded-md p-1 shadow-lg bg-bg-elevated border border-[var(--border-strong)] animate-fade-in"
        >
          <MenuItem icon={<Eye size={13} />} onClick={wrap(onView)}>View Details</MenuItem>
          <MenuItem icon={<Pencil size={13} />} onClick={wrap(onEdit)}>Edit Product</MenuItem>
          <MenuItem icon={<ScanLine size={13} />} onClick={wrap(onBarcode)}>Barcode Tag</MenuItem>
          <MenuItem icon={<History size={13} />} onClick={wrap(onHistory)}>Purchase History</MenuItem>
          <div className="my-1 h-px bg-[var(--border)]" />
          <MenuItem
            icon={<Trash2 size={13} />}
            onClick={wrap(onDelete)}
            className="text-[var(--negative)]"
          >
            Delete
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
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
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-sm hover:bg-surface-hover ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
