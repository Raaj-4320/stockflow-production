"use client";

import { Modal } from "../../../shared/components/ui/Modal";
import { Button } from "../../../shared/components/ui/Button";
import { Download, Plus } from "lucide-react";
import type { Product } from "../types";
import { stockStateFor } from "../types";
import { fmt } from "../utils/inventoryMetrics";

interface Props {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onAddPurchase: (p: Product) => void;
  onExport: () => void;
}

export function AdminLowStockModal({
  open,
  products,
  onClose,
  onAddPurchase,
  onExport,
}: Props) {
  const items = products
    .filter((p) => stockStateFor(p) !== "in_stock")
    .sort((a, b) => a.stock - b.stock);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Low Stock & Out of Stock"
      subtitle={`${items.length} product${items.length === 1 ? "" : "s"} need attention`}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" leftIcon={<Download size={13} />} onClick={onExport}>
            Export List
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-8 text-center text-muted text-sm">
            All stock levels are healthy 🎉
          </div>
        ) : (
          items.map((p) => {
            const s = stockStateFor(p);
            const dot =
              s === "out_of_stock"
                ? "bg-[var(--negative)]"
                : "bg-[var(--warning)]";
            const label =
              s === "out_of_stock"
                ? "text-[var(--negative)]"
                : "text-[var(--warning)]";
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 panel p-2.5"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted">
                    {p.sku} • Threshold {p.lowStockThreshold}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold nums ${label}`}>
                    {p.stock}
                  </div>
                  <div className="text-2xs text-muted nums">
                    {fmt(p.buyPrice)}
                  </div>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<Plus size={11} />}
                  onClick={() => onAddPurchase(p)}
                  className="text-[var(--positive)] border-[var(--positive-border)]"
                >
                  Restock
                </Button>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
