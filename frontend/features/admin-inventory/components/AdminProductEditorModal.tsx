"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Input } from "../../../shared/components/ui/Input";
import { NumberInput } from "../../../shared/components/ui/NumberInput";
import { Dropdown } from "../../../shared/components/ui/Dropdown";
import { Button } from "../../../shared/components/ui/Button";
import { AdminVariantMatrix } from "./AdminVariantMatrix";
import { useKeyboardShortcuts } from "../../../shared/hooks/useKeyboardShortcuts";
import type { Category, Product, VariantCell } from "../types";
import { ImagePlus, X as XIcon } from "lucide-react";

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
        {/* Image upload — first thing in the form */}
        <ProductImagePicker
          imageUrl={draft.imageUrl}
          onChange={(url) =>
            setDraft((d) => ({ ...d, imageUrl: url || undefined }))
          }
        />

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
          <Dropdown
            label="Category"
            required
            value={draft.category}
            onChange={(v) => setDraft({ ...draft, category: v })}
            placeholder="Select category…"
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
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
            <NumberInput
              label="Purchase Price"
              required
              leftElement="₹"
              min={0}
              value={draft.buyPrice}
              onChange={(n) => setDraft({ ...draft, buyPrice: n })}
              error={errors.buyPrice}
            />
            <NumberInput
              label="Sell Price"
              required
              leftElement="₹"
              min={0}
              value={draft.sellPrice}
              onChange={(n) => setDraft({ ...draft, sellPrice: n })}
              error={errors.sellPrice}
            />
            <NumberInput
              label="Quantity in Stock"
              allowDecimal={false}
              min={0}
              value={draft.stock}
              onChange={(n) => setDraft({ ...draft, stock: n })}
            />
            <NumberInput
              label="Low Stock Threshold"
              allowDecimal={false}
              min={0}
              value={draft.lowStockThreshold}
              onChange={(n) => setDraft({ ...draft, lowStockThreshold: n })}
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

function ProductImagePicker({
  imageUrl,
  onChange,
}: {
  imageUrl?: string;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5 MB or smaller");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="text-sm font-medium text-secondary mb-1.5">
        Product Image
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {imageUrl ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Product preview"
            className="w-24 h-24 rounded-md object-cover border border-subtle"
          />
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => inputRef.current?.click()}
              leftIcon={<ImagePlus size={13} />}
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onChange(null)}
              leftIcon={<XIcon size={13} />}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full panel hover:bg-surface-hover transition-colors p-5 flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-active grid place-items-center text-secondary">
            <ImagePlus size={18} />
          </div>
          <div className="text-sm font-medium">Click to upload an image</div>
          <div className="text-xs text-muted">PNG, JPG, WebP — up to 5 MB</div>
        </button>
      )}
    </div>
  );
}
