"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";
import type { PurchaseOrder, ReceiveMethod } from "../types";
import { useReceivePricePreview } from "../hooks/useReceivePricePreview";
import { ReceivePricePreviewTable } from "./ReceivePricePreviewTable";
import { Modal } from "../../../../shared/components/ui/Modal";
import { Button } from "../../../../shared/components/ui/Button";
import { RECEIVE_METHODS } from "../mockData";

interface ReceiveOrderDialogProps {
  order: PurchaseOrder | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, method: ReceiveMethod) => void;
}

export function ReceiveOrderDialog({
  order,
  open,
  onClose,
  onConfirm,
}: ReceiveOrderDialogProps) {
  const { method, setMethod, previewRows, summary } = useReceivePricePreview(order);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!order) return;
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 800));
    onConfirm(order.id, method);
    setConfirming(false);
    onClose();
  };

  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Receive Order"
      subtitle={`${order.orderNumber} · ${order.partyName}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-warning shrink-0" />
            This will update stock levels and buy prices.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={onClose} disabled={confirming}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={confirming}
              onClick={handleConfirm}
            >
              Confirm Receipt
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Warning banner */}
        <div className="flex items-start gap-3 p-4 bg-warning-bg border border-[var(--warning)] rounded-xl">
          <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--warning-text)]">
              This action affects inventory and pricing
            </p>
            <p className="text-xs text-[var(--warning-text)] mt-0.5 leading-relaxed">
              Receiving this order will add stock for all line items and may
              update buy prices based on the method you select below.
            </p>
          </div>
        </div>

        {/* Price method selection */}
        <div>
          <p className="text-sm font-semibold text-text-primary mb-3">
            Buy Price Update Method
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RECEIVE_METHODS.map((m) => {
              const isSelected = method === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={clsx(
                    "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all duration-[var(--transition-fast)]",
                    isSelected
                      ? "border-accent bg-accent-light"
                      : "border-border-subtle hover:border-border-default"
                  )}
                >
                  {/* Radio button */}
                  <div
                    className={clsx(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                      isSelected ? "border-accent" : "border-border-default"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <div>
                    <p
                      className={clsx(
                        "text-sm font-semibold",
                        isSelected ? "text-accent" : "text-text-primary"
                      )}
                    >
                      {m.label}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {m.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Change summary pills */}
        {summary.total > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-text-muted">Price changes:</span>
            {summary.increases > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-success-bg rounded-full text-xs font-medium text-[var(--success-text)]">
                <TrendingUp size={11} />
                {summary.increases} increase{summary.increases !== 1 ? "s" : ""}
              </span>
            )}
            {summary.decreases > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-danger-bg rounded-full text-xs font-medium text-[var(--danger-text)]">
                <TrendingDown size={11} />
                {summary.decreases} decrease{summary.decreases !== 1 ? "s" : ""}
              </span>
            )}
            {summary.unchanged > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-bg-primary rounded-full text-xs text-text-muted border border-border-subtle">
                <Minus size={11} />
                {summary.unchanged} unchanged
              </span>
            )}
          </div>
        )}

        {/* Preview table */}
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">
            Price Preview
          </p>
          <ReceivePricePreviewTable rows={previewRows} />
        </div>
      </div>
    </Modal>
  );
}
