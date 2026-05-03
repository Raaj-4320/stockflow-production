"use client";

import { Check, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import type { Product } from "../types";
import { formatCurrency, formatNumber } from "../utils/purchaseCalculations";

interface VariantSelectorStepProps {
  product: Product;
  selectedIds: string[];
  onToggle: (variantId: string, product: Product) => void;
  onToggleAll: (product: Product, selectAll: boolean) => void;
}

export function VariantSelectorStep({
  product,
  selectedIds,
  onToggle,
  onToggleAll,
}: VariantSelectorStepProps) {
  const allSelected = selectedIds.length === product.variants.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Group variants by color
  const byColor = product.variants.reduce<Record<string, typeof product.variants>>(
    (acc, v) => {
      const key = v.color ?? "Default";
      acc[key] = [...(acc[key] ?? []), v];
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Select Variants to Order
        </h3>
        <p className="text-sm text-text-muted mt-1">
          {product.name} — choose the variants you want to include in this order.
        </p>
      </div>

      {/* Select all */}
      <div className="flex items-center justify-between p-3 bg-bg-primary rounded-lg border border-border-subtle">
        <div className="flex items-center gap-2">
          <CheckboxUI
            checked={allSelected}
            indeterminate={someSelected}
            onChange={() => onToggleAll(product, !allSelected)}
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-text-primary cursor-pointer">
            Select all variants
          </label>
        </div>
        <span className="text-xs text-text-muted">
          {selectedIds.length} / {product.variants.length} selected
        </span>
      </div>

      {/* Grouped by color */}
      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
        {Object.entries(byColor).map(([color, variants]) => (
          <div key={color}>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              {color}
            </p>
            <div className="space-y-1.5">
              {variants.map((variant) => {
                const isSelected = selectedIds.includes(variant.id);
                return (
                  <button
                    key={variant.id}
                    onClick={() => onToggle(variant.id, product)}
                    className={clsx(
                      "flex items-center gap-3 w-full p-3 rounded-lg border transition-all duration-[var(--transition-fast)] text-left",
                      isSelected
                        ? "border-accent bg-accent-light"
                        : "border-border-subtle bg-bg-surface hover:border-border-default hover:bg-bg-hover"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                        isSelected
                          ? "border-accent bg-accent"
                          : "border-border-default"
                      )}
                    >
                      {isSelected && (
                        <Check size={10} strokeWidth={3} className="text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <span className="text-sm font-medium text-text-primary">
                        {variant.name}
                      </span>
                      <span className="text-xs text-text-muted ml-2 font-mono">
                        {variant.sku}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-text-primary">
                        {formatCurrency(variant.currentBuyPrice)}
                      </p>
                      <p className="text-xs text-text-muted">
                        Stock: {formatNumber(variant.currentStock)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedIds.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-warning-bg rounded-lg border border-[var(--warning)]">
          <AlertCircle size={15} className="text-warning shrink-0" />
          <p className="text-xs text-[var(--warning-text)]">
            Select at least one variant to continue.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Mini Checkbox ────────────────────────────────────────────────────────────

function CheckboxUI({
  checked,
  indeterminate,
  onChange,
  id,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  id: string;
}) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={onChange}
      className={clsx(
        "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
        checked || indeterminate
          ? "border-accent bg-accent"
          : "border-border-default bg-bg-surface"
      )}
    >
      {checked && <Check size={10} strokeWidth={3} className="text-white" />}
      {indeterminate && !checked && (
        <span className="w-2 h-0.5 bg-white rounded-full" />
      )}
    </button>
  );
}
