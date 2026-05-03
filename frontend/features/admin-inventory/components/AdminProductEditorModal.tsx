"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Input, Select } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";
import { AdminVariantMatrix } from "./AdminVariantMatrix";
import { useKeyboardShortcuts } from "../../../shared/hooks/useKeyboardShortcuts";
import type { Category, Product, VariantCell } from "../types";

interface Props {
  open: boolean;
  product?: Product | null;
  categories: Category[];
  variantsMaster: string[];
  colorsMaster: string[];
  onClose: () => void;
  onSubmit: (p: Product) => void;
}

const empty = (): Product => ({
  id: "",
  name: "",
  sku: "",
  barcode: "",
  category: "",
  buyPrice: 0,
  sellPrice: 0,
  stock: 0,
  lowStockThreshold: 10,
  hasVariants: false,
  createdAt: new Date().toISOString().slice(0, 10),
});

export function AdminProductEditorModal({
  open,
  product,
  categories,
  variantsMaster,
  colorsMaster,
  onClose,
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<Product>(empty());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(product ? { ...product } : empty());
      setErrors({});
      setTimeout(() => firstFieldRef.current?.focus(), 50);
    }
  }, [open, product]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!draft.name.trim()) e.name = "Required";
    if (!draft.sku.trim()) e.sku = "Required";
    if (!draft.category) e.category = "Required";
    if (!draft.hasVariants) {
      if (draft.buyPrice < 0) e.buyPrice = "Must be ≥ 0";
      if (draft.sellPrice < 0) e.sellPrice = "Must be ≥ 0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    let final = { ...draft };
    if (final.hasVariants && final.matrix) {
      final.stock = final.matrix.reduce((sum, c) => sum + c.stock, 0);
    }
    onSubmit(final);
    onClose();
  };

  const formRef = useKeyboardShortcuts<HTMLDivElement>({
    onSave: handleSave,
    onCancel: onClose,
    enabled: open,
  });

  const totalMatrixStock = useMemo(
    () => (draft.matrix ?? []).reduce((s, c) => s + c.stock, 0),
    [draft.matrix]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={product ? "Edit Product" : "Add Product"}
      subtitle="Press Enter to save • Tab to navigate • Esc to cancel"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {product ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      }
    >
      <div ref={formRef} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            ref={firstFieldRef}
            label="Product Name"
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="SKU"
            required
            value={draft.sku}
            onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
            error={errors.sku}
          />
          <Select
            label="Category"
            required
            options={[
              { value: "", label: "Select category…" },
              ...categories.map((c) => ({ value: c.name, label: c.name })),
            ]}
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            error={errors.category}
          />
          <Input
            label="Barcode"
            value={draft.barcode ?? ""}
            onChange={(e) => setDraft({ ...draft, barcode: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.hasVariants}
            onChange={(e) => {
              const has = e.target.checked;
              setDraft((d) => ({
                ...d,
                hasVariants: has,
                variants: has ? d.variants ?? [] : undefined,
                colors: has ? d.colors ?? [] : undefined,
                matrix: has ? d.matrix ?? [] : undefined,
              }));
            }}
            className="w-4 h-4 accent-current"
          />
          <span>This product has variants (size / color / etc.)</span>
        </label>

        {!draft.hasVariants ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              label="Buy Price"
              type="number"
              required
              leftElement="₹"
              value={draft.buyPrice}
              onChange={(e) =>
                setDraft({ ...draft, buyPrice: Number(e.target.value) || 0 })
              }
              error={errors.buyPrice}
            />
            <Input
              label="Sell Price"
              type="number"
              required
              leftElement="₹"
              value={draft.sellPrice}
              onChange={(e) =>
                setDraft({ ...draft, sellPrice: Number(e.target.value) || 0 })
              }
              error={errors.sellPrice}
            />
            <Input
              label="Stock"
              type="number"
              value={draft.stock}
              onChange={(e) =>
                setDraft({ ...draft, stock: Number(e.target.value) || 0 })
              }
            />
            <Input
              label="Low Stock Threshold"
              type="number"
              value={draft.lowStockThreshold}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  lowStockThreshold: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        ) : (
          <>
            <AdminVariantMatrix
              variants={draft.variants ?? []}
              colors={draft.colors ?? []}
              cells={draft.matrix ?? []}
              variantsMaster={variantsMaster}
              colorsMaster={colorsMaster}
              onChange={({ variants, colors, cells }) =>
                setDraft((d) => ({
                  ...d,
                  variants,
                  colors,
                  matrix: cells as VariantCell[],
                }))
              }
            />
            <div className="text-xs text-muted">
              Computed total stock from matrix:{" "}
              <span className="text-text font-medium nums">
                {totalMatrixStock}
              </span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
