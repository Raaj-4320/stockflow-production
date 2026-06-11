"use client";

import {
  Download,
  Plus,
  FolderPlus,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

interface ActionBarProps {
  view: "table" | "card";
  onViewChange: (v: "table" | "card") => void;
  onExport: () => void;
  onAddPurchase: () => void;
  onAddProduct: () => void;
  onAddCategory: () => void;
}

/**
 * Single action row — no tabs (per spec).
 * Left: Export · Add Purchase · Add Product · Add Category · Manage
 * Right: Table / Cards toggle
 */
export function AdminInventoryActionBar({
  view,
  onViewChange,
  onExport,
  onAddPurchase,
  onAddProduct,
  onAddCategory,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" leftIcon={<Download size={13} />} onClick={onExport}>
        Export
      </Button>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
        }
        onClick={onAddPurchase}
      >
        Add Purchase
      </Button>
      <Button variant="secondary" size="sm" leftIcon={<Plus size={13} />} onClick={onAddProduct}>
        Add Product
      </Button>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<FolderPlus size={13} />}
        onClick={onAddCategory}
      >
        Add Category
      </Button>

      <div className="inline-flex panel p-1 rounded-md ml-auto">
        <button
          onClick={() => onViewChange("table")}
          className={`flex items-center gap-1.5 px-3 h-7 rounded-sm text-xs font-medium transition-all ${
            view === "table" ? "bg-text text-bg" : "text-secondary hover:text-text"
          }`}
        >
          <LayoutList size={13} /> Table
        </button>
        <button
          onClick={() => onViewChange("card")}
          className={`flex items-center gap-1.5 px-3 h-7 rounded-sm text-xs font-medium transition-all ${
            view === "card" ? "bg-text text-bg" : "text-secondary hover:text-text"
          }`}
        >
          <LayoutGrid size={13} /> Cards
        </button>
      </div>
    </div>
  );
}
