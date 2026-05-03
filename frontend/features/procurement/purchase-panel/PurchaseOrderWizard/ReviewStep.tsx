"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import type { WizardDraft, Party, OrderLineItem } from "../types";
import { computeLineItem, formatCurrency } from "../utils/purchaseCalculations";
import { Select as SelectInput, Textarea } from "../../../../shared/components/ui/Input";
import { OrderStatusBadge } from "../../../../shared/components/ui/Badge";

interface ReviewStepProps {
  draft: WizardDraft;
  parties: Party[];
  totals: { subtotal: number; totalGst: number; grandTotal: number };
  onUpdateDraft: (partial: Partial<WizardDraft>) => void;
}

export function ReviewStep({
  draft,
  parties,
  totals,
  onUpdateDraft,
}: ReviewStepProps) {
  const selectedParty = parties.find((p) => p.id === draft.partyId);
  const validItems = draft.lineItems.filter(
    (item): item is OrderLineItem =>
      typeof item.quantity === "number" &&
      item.quantity > 0 &&
      typeof item.unitCost === "number" &&
      item.unitCost > 0
  );
  const invalidItems = draft.lineItems.filter(
    (item) =>
      !item.quantity ||
      item.quantity <= 0 ||
      !item.unitCost ||
      item.unitCost <= 0
  );

  const partyOptions = [
    { value: "", label: "Select supplier…" },
    ...parties.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Review Order
        </h3>
        <p className="text-sm text-text-muted mt-1">
          Confirm all details before creating the purchase order.
        </p>
      </div>

      {/* Supplier selection (required to proceed) */}
      <div className="p-4 bg-bg-primary rounded-xl border border-border-subtle space-y-3">
        <p className="text-sm font-semibold text-text-primary">Supplier</p>
        <SelectInput
          options={partyOptions}
          value={draft.partyId ?? ""}
          onChange={(e) => onUpdateDraft({ partyId: e.target.value || null })}
          required
          error={!draft.partyId ? "Please select a supplier to proceed" : undefined}
        />
        {selectedParty && (
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 size={13} className="text-success" />
            <span className="text-xs text-text-secondary">
              {selectedParty.contactPerson
                ? `${selectedParty.contactPerson} · `
                : ""}
              {selectedParty.phone ?? selectedParty.email ?? "No contact info"}
            </span>
          </div>
        )}
      </div>

      {/* Warnings */}
      {invalidItems.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-warning-bg border border-[var(--warning)] rounded-lg">
          <AlertTriangle size={15} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[var(--warning-text)]">
              {invalidItems.length} item{invalidItems.length !== 1 ? "s" : ""} with missing data
            </p>
            <p className="text-xs text-[var(--warning-text)] mt-0.5">
              Variants without quantity or cost will be excluded from the order.
            </p>
            <div className="mt-1.5 space-y-0.5">
              {invalidItems.map((item) => (
                <p key={item.id} className="text-xs text-[var(--warning-text)] font-mono">
                  • {item.variantName ?? item.sku ?? item.id}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order summary table */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-2">
          Order Lines ({validItems.length})
        </p>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full border-collapse min-w-[400px]">
            <thead className="bg-bg-primary">
              <tr>
                {["Variant", "SKU", "Qty", "Unit Cost", "Total"].map((h, i) => (
                  <th
                    key={h}
                    className={clsx(
                      "px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border-subtle",
                      i === 0 ? "text-left" : "text-right"
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-text-muted">
                    No valid line items — go back to Pricing to fill in quantities
                  </td>
                </tr>
              ) : (
                validItems.map((item) => {
                  const c = computeLineItem(item);
                  return (
                    <tr key={item.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-3 py-2.5 text-sm text-text-primary">{item.variantName}</td>
                      <td className="px-3 py-2.5 text-xs text-text-muted text-right font-mono">{item.sku}</td>
                      <td className="px-3 py-2.5 text-sm text-text-primary text-right">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-sm text-text-primary text-right">{formatCurrency(item.unitCost)}</td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-text-primary text-right">{formatCurrency(c.lineTotal)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      {validItems.length > 0 && (
        <div className="bg-accent-light rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>GST</span>
            <span>{formatCurrency(totals.totalGst)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold text-text-primary pt-2 border-t border-border-subtle">
            <span>Grand Total</span>
            <span>{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        placeholder="Add any special instructions or notes for this order…"
        value={draft.notes}
        onChange={(e) => onUpdateDraft({ notes: e.target.value })}
        rows={3}
      />

      {/* Status preview */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Order status will be set to:</span>
        <OrderStatusBadge status="ordered" />
      </div>
    </div>
  );
}
