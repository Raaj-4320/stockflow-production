"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Package, ChevronRight, Layers } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Input } from "../../../shared/components/ui/Input";
import { Dropdown } from "../../../shared/components/ui/Dropdown";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import type { Product, VariantCell } from "../types";
import { fmt } from "../utils/inventoryMetrics";

interface PickerProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  /** Called when user finishes selecting product (and variant if applicable). */
  onPick: (product: Product, variant?: VariantCell) => void;
}

export function AdminProductPickerModal({
  open,
  products,
  onClose,
  onPick,
}: PickerProps) {
  const [step, setStep] = useState<"product" | "variant">("product");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [variantKey, setVariantKey] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setStep("product");
    setQuery("");
    setSelected(null);
    setVariantKey("");
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 12);
    return products
      .filter((p) => {
        const hay = `${p.name} ${p.sku} ${p.barcode ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 20);
  }, [products, query]);

  const variantOptions = useMemo(() => {
    if (!selected?.matrix) return [];
    return selected.matrix.map((c) => ({
      key: `${c.variant}__${c.color}`,
      label: `${c.variant} · ${c.color}`,
      cell: c,
    }));
  }, [selected]);

  const handleProductPick = (p: Product) => {
    if (p.hasVariants && p.matrix && p.matrix.length > 0) {
      setSelected(p);
      setStep("variant");
    } else {
      onPick(p);
    }
  };

  const handleVariantConfirm = () => {
    if (!selected) return;
    const cell = selected.matrix?.find(
      (c) => `${c.variant}__${c.color}` === variantKey
    );
    onPick(selected, cell);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={step === "product" ? "Add Purchase" : "Choose Variant"}
      subtitle={
        step === "product"
          ? "Search and select the product you want to receive stock for."
          : `${selected?.name} has variants — pick one to record this purchase against.`
      }
      footer={
        step === "variant" && (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setStep("product");
                setSelected(null);
                setVariantKey("");
              }}
            >
              ← Back to product search
            </Button>
            <Button
              onClick={handleVariantConfirm}
              disabled={!variantKey}
            >
              Continue
            </Button>
          </div>
        )
      }
    >
      {step === "product" ? (
        <>
          <Input
            autoFocus
            leftElement={<Search size={14} />}
            placeholder="Search by product name, SKU or barcode…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-2xs uppercase tracking-wider text-muted font-medium mt-4 mb-2 px-1">
            {query.trim() ? `Results (${matches.length})` : "Recently added"}
          </div>
          <div className="max-h-[420px] overflow-y-auto space-y-1 -mx-1 px-1">
            {matches.length === 0 ? (
              <div className="text-sm text-muted py-6 text-center">
                No products found for &quot;{query}&quot;.
              </div>
            ) : (
              matches.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProductPick(p)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-surface-hover transition-colors text-left border border-transparent hover:border-subtle"
                >
                  <div className="w-9 h-9 rounded-md bg-surface-active grid place-items-center shrink-0 text-faint">
                    <Package size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted truncate">
                      {p.sku} · Stock {p.stock}
                    </div>
                  </div>
                  <Badge tone="subtle">{p.category}</Badge>
                  {p.hasVariants && (
                    <span
                      className="inline-flex items-center gap-1 text-2xs text-secondary"
                      title="Has variants"
                    >
                      <Layers size={11} /> variants
                    </span>
                  )}
                  <ChevronRight size={14} className="text-muted shrink-0" />
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="panel p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-surface-active grid place-items-center text-faint">
              <Package size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{selected?.name}</div>
              <div className="text-xs text-muted">
                {selected?.sku} · {variantOptions.length} variant
                {variantOptions.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <Dropdown
            label="Variant"
            required
            value={variantKey}
            onChange={setVariantKey}
            placeholder="Select a variant…"
            options={variantOptions.map((v) => ({
              value: v.key,
              label: v.label,
              hint: `Stock ${v.cell.stock} · ${fmt(v.cell.buyPrice)}`,
            }))}
          />
        </div>
      )}
    </Modal>
  );
}
