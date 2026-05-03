"use client";

import { AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import type { OrderLineItem } from "../types";
import { computeLineItem, formatCurrency } from "../utils/purchaseCalculations";
import type { LineItemValidationError } from "../utils/purchaseCalculations";

interface PricingMatrixStepProps {
  lineItems: Array<Partial<OrderLineItem> & { id: string }>;
  onUpdate: (
    id: string,
    field: "quantity" | "unitCost" | "gstPercent",
    value: number
  ) => void;
  errors: LineItemValidationError[];
  totals: { subtotal: number; totalGst: number; grandTotal: number };
}

export function PricingMatrixStep({
  lineItems,
  onUpdate,
  errors,
  totals,
}: PricingMatrixStepProps) {
  const getErrors = (id: string) =>
    errors.filter((e) => e.itemId === id);

  const fieldError = (id: string, field: string) =>
    errors.find((e) => e.itemId === id && e.field === field)?.message;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Set Pricing & Quantities
        </h3>
        <p className="text-sm text-text-muted mt-1">
          Enter quantities and unit costs for each variant. GST is optional.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full border-collapse min-w-[580px]">
          <thead className="bg-bg-primary">
            <tr>
              {["Variant / SKU", "Quantity", "Unit Cost (₹)", "GST %", "Line Total"].map((h, i) => (
                <th
                  key={h}
                  className={clsx(
                    "px-3 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border-subtle",
                    i === 0 ? "text-left" : "text-right"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => {
              const itemErrors = getErrors(item.id);
              const hasErrors = itemErrors.length > 0;
              const computed =
                item.quantity && item.unitCost
                  ? computeLineItem(item as OrderLineItem)
                  : null;

              return (
                <tr
                  key={item.id}
                  className={clsx(
                    "border-b border-border-subtle last:border-0",
                    hasErrors && "bg-danger-bg/30"
                  )}
                >
                  {/* Variant */}
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium text-text-primary">
                      {item.variantName}
                    </p>
                    <p className="text-xs text-text-muted font-mono mt-0.5">
                      {item.sku}
                    </p>
                    {hasErrors && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle size={10} className="text-danger shrink-0" />
                        <p className="text-xs text-danger">
                          {itemErrors.map((e) => e.message).join(" · ")}
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-3 py-2.5">
                    <NumberInput
                      value={item.quantity ?? 0}
                      onChange={(v) => onUpdate(item.id, "quantity", v)}
                      min={0}
                      error={!!fieldError(item.id, "quantity")}
                      placeholder="0"
                    />
                  </td>

                  {/* Unit cost */}
                  <td className="px-3 py-2.5">
                    <NumberInput
                      value={item.unitCost ?? 0}
                      onChange={(v) => onUpdate(item.id, "unitCost", v)}
                      min={0}
                      step={0.01}
                      error={!!fieldError(item.id, "unitCost")}
                      placeholder="0.00"
                    />
                  </td>

                  {/* GST */}
                  <td className="px-3 py-2.5">
                    <NumberInput
                      value={item.gstPercent ?? 0}
                      onChange={(v) => onUpdate(item.id, "gstPercent", v)}
                      min={0}
                      max={100}
                      placeholder="0"
                      suffix="%"
                    />
                  </td>

                  {/* Line total */}
                  <td className="px-3 py-2.5 text-right">
                    <p className="text-sm font-semibold text-text-primary">
                      {computed ? formatCurrency(computed.lineTotal) : "—"}
                    </p>
                    {computed && computed.lineGst > 0 && (
                      <p className="text-xs text-text-muted">
                        +{formatCurrency(computed.lineGst)} GST
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sticky totals */}
      <div className="sticky bottom-0 bg-bg-surface border border-border-subtle rounded-xl p-4 shadow-lg">
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-12">
              <span className="text-xs text-text-muted">Subtotal</span>
              <span className="text-sm text-text-primary font-medium">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-12">
              <span className="text-xs text-text-muted">GST</span>
              <span className="text-sm text-text-primary font-medium">
                {formatCurrency(totals.totalGst)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted mb-0.5">Grand Total</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(totals.grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Number Input ──────────────────────────────────────────────────────

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
  placeholder,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: boolean;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number"
        value={value || ""}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(isNaN(v) ? 0 : v);
        }}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={clsx(
          "w-20 h-7 px-2 text-right text-sm rounded-md border bg-bg-surface",
          "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-border-focus",
          "transition-colors duration-[var(--transition-fast)]",
          "text-text-primary placeholder:text-text-muted",
          error
            ? "border-danger"
            : "border-border-default hover:border-border-strong"
        )}
      />
      {suffix && <span className="text-xs text-text-muted">{suffix}</span>}
    </div>
  );
}
