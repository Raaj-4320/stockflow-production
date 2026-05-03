"use client";

import { Package, Building2, Edit2, Truck, MoreVertical, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import type { PurchaseOrder } from "../types";
import { OrderStatusBadge } from "../../../../shared/components/ui/Badge";
import { formatCurrency, formatNumber } from "../utils/purchaseCalculations";
import { formatRelativeDate } from "../utils/purchaseMappers";

interface PurchaseOrderCardProps {
  order: PurchaseOrder;
  onEdit: (order: PurchaseOrder) => void;
  onReceive: (order: PurchaseOrder) => void;
  onDelete?: (order: PurchaseOrder) => void;
}

export function PurchaseOrderCard({
  order,
  onEdit,
  onReceive,
  onDelete,
}: PurchaseOrderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActionable =
    order.status !== "received" && order.status !== "cancelled";

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div
      className={clsx(
        "group bg-bg-surface border border-border-subtle rounded-lg p-4 sm:p-5",
        "transition-all duration-[var(--transition)] hover:-translate-y-0.5 hover:shadow-md",
        "hover:border-border-default"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Party avatar */}
          <div className="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center shrink-0 text-accent font-semibold text-sm">
            {order.partyName.charAt(0)}
          </div>

          {/* Core info */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate leading-tight">
              {order.partyName}
            </p>
            <p className="text-xs text-text-muted mt-0.5 font-mono">
              {order.orderNumber}
            </p>
          </div>
        </div>

        {/* Status + menu */}
        <div className="flex items-center gap-2 shrink-0">
          <OrderStatusBadge status={order.status} />
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Order options"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-7 z-20 bg-bg-surface border border-border-subtle rounded-lg shadow-lg py-1 min-w-[140px]"
                style={{ animation: "slideDown 120ms ease-out" }}
              >
                <button
                  onClick={() => { onEdit(order); setMenuOpen(false); }}
                  disabled={!isActionable}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Edit2 size={13} />
                  Edit Order
                </button>
                <button
                  onClick={() => { onReceive(order); setMenuOpen(false); }}
                  disabled={!isActionable}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Truck size={13} />
                  Receive Order
                </button>
                {onDelete && (
                  <>
                    <div className="my-1 border-t border-border-subtle" />
                    <button
                      onClick={() => { onDelete(order); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-bg"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Package size={12} />
          <span>
            {formatNumber(order.lineItems.length)} item
            {order.lineItems.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Building2 size={12} />
          <span className="truncate max-w-[120px]">
            {order.partyName.split(" ")[0]}
          </span>
        </div>
        <div className="ml-auto text-sm font-semibold text-text-primary">
          {formatCurrency(order.totalAmount)}
        </div>
      </div>

      {/* Date + actions row */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-text-muted">
          {formatRelativeDate(order.createdAt)}
        </span>

        {/* Quick-action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(order)}
            disabled={!isActionable}
            className={clsx(
              "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium transition-all duration-[var(--transition-fast)]",
              isActionable
                ? "text-text-secondary border border-border-subtle hover:border-border-default hover:bg-bg-hover"
                : "opacity-40 cursor-not-allowed border border-border-subtle text-text-muted"
            )}
            title={!isActionable ? "Cannot edit a completed order" : "Edit order"}
          >
            <Edit2 size={11} />
            Edit
          </button>
          <button
            onClick={() => onReceive(order)}
            disabled={!isActionable}
            className={clsx(
              "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium transition-all duration-[var(--transition-fast)]",
              isActionable
                ? "text-accent border border-accent/30 hover:bg-accent-light"
                : "opacity-40 cursor-not-allowed border border-border-subtle text-text-muted"
            )}
            title={!isActionable ? "Order already received" : "Receive order"}
          >
            <Truck size={11} />
            Receive
          </button>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <p className="mt-2 text-xs text-text-muted italic truncate-2 leading-relaxed">
          {order.notes}
        </p>
      )}
    </div>
  );
}
