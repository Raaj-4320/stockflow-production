import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";
import type { ReceivePreviewRow } from "../types";
import { formatCurrency, formatPercent } from "../utils/purchaseCalculations";

interface ReceivePricePreviewTableProps {
  rows: ReceivePreviewRow[];
}

export function ReceivePricePreviewTable({ rows }: ReceivePricePreviewTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        No preview data available.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full border-collapse min-w-[480px]">
        <thead className="bg-bg-primary">
          <tr>
            {["Variant", "SKU", "Qty", "Current Buy Price", "New Buy Price", "Change"].map(
              (h, i) => (
                <th
                  key={h}
                  className={clsx(
                    "px-3 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border-subtle",
                    i === 0 ? "text-left" : "text-right"
                  )}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <PricePreviewRow key={row.variantId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricePreviewRow({ row }: { row: ReceivePreviewRow }) {
  const isIncrease = row.changeType === "increase";
  const isDecrease = row.changeType === "decrease";
  const isNoChange = row.changeType === "no_change";

  return (
    <tr
      className={clsx(
        "border-b border-border-subtle last:border-0 transition-colors",
        isIncrease && "bg-[var(--success-bg)]/40 hover:bg-[var(--success-bg)]/60",
        isDecrease && "bg-danger-bg/40 hover:bg-danger-bg/60",
        isNoChange && "hover:bg-bg-hover"
      )}
    >
      {/* Variant */}
      <td className="px-3 py-3">
        <p className="text-sm font-medium text-text-primary">{row.variantName}</p>
      </td>

      {/* SKU */}
      <td className="px-3 py-3 text-right">
        <span className="text-xs text-text-muted font-mono">{row.sku}</span>
      </td>

      {/* Qty */}
      <td className="px-3 py-3 text-right">
        <span className="text-sm text-text-secondary">{row.quantity}</span>
      </td>

      {/* Current price */}
      <td className="px-3 py-3 text-right">
        <span className="text-sm text-text-secondary">
          {formatCurrency(row.currentBuyPrice)}
        </span>
      </td>

      {/* New price */}
      <td className="px-3 py-3 text-right">
        <span
          className={clsx(
            "text-sm font-semibold",
            isIncrease && "text-[var(--success-text)]",
            isDecrease && "text-[var(--danger-text)]",
            isNoChange && "text-text-primary"
          )}
        >
          {formatCurrency(row.newBuyPrice)}
        </span>
      </td>

      {/* Change */}
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {isIncrease && (
            <>
              <TrendingUp size={12} className="text-[var(--success)]" />
              <span className="text-xs font-semibold text-[var(--success-text)]">
                {formatPercent(row.changePercent)}
              </span>
            </>
          )}
          {isDecrease && (
            <>
              <TrendingDown size={12} className="text-danger" />
              <span className="text-xs font-semibold text-[var(--danger-text)]">
                {formatPercent(row.changePercent)}
              </span>
            </>
          )}
          {isNoChange && (
            <>
              <Minus size={12} className="text-text-muted" />
              <span className="text-xs text-text-muted">No change</span>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
