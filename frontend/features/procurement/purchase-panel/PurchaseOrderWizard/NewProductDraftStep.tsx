"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import type { NewProductDraft, NewVariantDraft } from "../types";
import { Input, Select } from "../../../../shared/components/ui/Input";
import { Button } from "../../../../shared/components/ui/Button";
import { PRODUCT_CATEGORIES } from "../mockData";

interface NewProductDraftStepProps {
  draft: NewProductDraft | null;
  onChange: (draft: NewProductDraft) => void;
}

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }));

const newVariant = (index: number): NewVariantDraft => ({
  id: `new-var-${Date.now()}-${index}`,
  name: "",
  sku: "",
  color: "",
  size: "",
});

export function NewProductDraftStep({ draft, onChange }: NewProductDraftStepProps) {
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const current: NewProductDraft = draft ?? {
    name: "",
    category: PRODUCT_CATEGORIES[0],
    variants: [newVariant(0)],
  };

  const update = (partial: Partial<NewProductDraft>) => {
    onChange({ ...current, ...partial });
  };

  const touch = (key: string) =>
    setTouched((prev) => new Set(prev).add(key));

  const updateVariant = (id: string, field: keyof NewVariantDraft, value: string) => {
    onChange({
      ...current,
      variants: current.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    });
  };

  const addVariant = () => {
    onChange({
      ...current,
      variants: [...current.variants, newVariant(current.variants.length)],
    });
  };

  const removeVariant = (id: string) => {
    onChange({
      ...current,
      variants: current.variants.filter((v) => v.id !== id),
    });
  };

  const nameError = touched.has("name") && !current.name.trim()
    ? "Product name is required"
    : undefined;

  const variantErrors = current.variants.reduce<Record<string, string>>(
    (acc, v, i) => {
      if (touched.has(`sku-${v.id}`) && !v.sku.trim()) {
        acc[`sku-${v.id}`] = "SKU required";
      }
      if (touched.has(`name-${v.id}`) && !v.name.trim()) {
        acc[`name-${v.id}`] = "Variant name required";
      }
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          New Product Details
        </h3>
        <p className="text-sm text-text-muted mt-1">
          Define the product name and its variants (colors, sizes, SKUs).
        </p>
      </div>

      {/* Product info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Product Name"
          required
          placeholder="e.g. Classic Cotton T-Shirt"
          value={current.name}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={() => touch("name")}
          error={nameError}
        />
        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={current.category}
          onChange={(e) => update({ category: e.target.value })}
        />
      </div>

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-text-secondary">
            Variants ({current.variants.length})
          </p>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus size={13} />}
            onClick={addVariant}
          >
            Add Variant
          </Button>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {current.variants.map((variant, index) => (
            <div
              key={variant.id}
              className="bg-bg-primary rounded-lg border border-border-subtle p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Variant {index + 1}
                </span>
                {current.variants.length > 1 && (
                  <button
                    onClick={() => removeVariant(variant.id)}
                    className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger-bg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Input
                  label="Name"
                  required
                  placeholder="e.g. M / Black"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                  onBlur={() => touch(`name-${variant.id}`)}
                  error={variantErrors[`name-${variant.id}`]}
                  className="col-span-2 sm:col-span-1"
                />
                <Input
                  label="SKU"
                  required
                  placeholder="TS-M-BLK"
                  value={variant.sku}
                  onChange={(e) => updateVariant(variant.id, "sku", e.target.value.toUpperCase())}
                  onBlur={() => touch(`sku-${variant.id}`)}
                  error={variantErrors[`sku-${variant.id}`]}
                />
                <Input
                  label="Color"
                  placeholder="Black"
                  value={variant.color}
                  onChange={(e) => updateVariant(variant.id, "color", e.target.value)}
                />
                <Input
                  label="Size"
                  placeholder="M"
                  value={variant.size}
                  onChange={(e) => updateVariant(variant.id, "size", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {current.variants.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-warning-bg rounded-lg border border-[var(--warning)]">
          <AlertCircle size={15} className="text-warning shrink-0" />
          <p className="text-xs text-[var(--warning-text)]">
            Add at least one variant to proceed.
          </p>
        </div>
      )}
    </div>
  );
}
