"use client";

import {
  Package,
  TrendingUp,
  AlertTriangle,
  Boxes,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { fmt } from "../utils/inventoryMetrics";
import type { InventoryMetrics } from "../utils/inventoryMetrics";
import { Card } from "../../../shared/components/ui/Card";

type Tone = "positive" | "warning" | "negative" | "neutral";

const toneClass: Record<Tone, { bg: string; fg: string; ring: string }> = {
  positive: {
    bg: "bg-[var(--positive-bg)]",
    fg: "text-[var(--positive)]",
    ring: "ring-1 ring-[var(--positive-border)]",
  },
  warning: {
    bg: "bg-[var(--warning-bg)]",
    fg: "text-[var(--warning)]",
    ring: "ring-1 ring-[var(--warning-border)]",
  },
  negative: {
    bg: "bg-[var(--negative-bg)]",
    fg: "text-[var(--negative)]",
    ring: "ring-1 ring-[var(--negative-border)]",
  },
  neutral: {
    bg: "bg-[var(--surface-active)]",
    fg: "text-secondary",
    ring: "",
  },
};

interface CardSpec {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: Tone;
  delta?: { value: string; positive: boolean };
  alert?: string;
}

export function AdminInventoryStats({
  metrics,
  onLowStockClick,
}: {
  metrics: InventoryMetrics;
  onLowStockClick?: () => void;
}) {
  const cards: CardSpec[] = [
    {
      label: "Inventory Value (Cost)",
      value: fmt(metrics.inventoryValue),
      sublabel: "Total cost of inventory",
      icon: Boxes,
      tone: "positive",
      delta: { value: "+4.2%", positive: true },
    },
    {
      label: "Total Investment Till Date",
      value: fmt(metrics.investmentTillDate),
      sublabel: "Total investment",
      icon: TrendingUp,
      tone: "positive",
      delta: { value: "+8.1%", positive: true },
    },
    {
      label: "Total Products",
      value: String(metrics.totalProducts),
      sublabel: `Across ${metrics.categoryCount} categories`,
      icon: Package,
      tone: "warning",
      delta: { value: "+3", positive: true },
    },
    {
      label: "Low Stock Alerts",
      value: String(metrics.lowStock + metrics.outOfStock),
      sublabel: "Items need attention",
      icon: AlertTriangle,
      tone: "negative",
      alert: "Action needed",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const t = toneClass[c.tone];
        const isLowStock = i === 3;
        return (
          <Card
            key={c.label}
            padding="md"
            hover
            className={isLowStock && onLowStockClick ? "cursor-pointer" : ""}
          >
            <div
              onClick={isLowStock ? onLowStockClick : undefined}
              className="flex items-start gap-3"
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-lg grid place-items-center ${t.bg} ${t.ring}`}
              >
                <Icon size={18} className={t.fg} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs text-secondary truncate">{c.label}</div>
                  {c.delta && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        c.delta.positive
                          ? "text-[var(--positive)]"
                          : "text-[var(--negative)]"
                      }`}
                    >
                      <ArrowUpRight size={12} />
                      {c.delta.value}
                    </span>
                  )}
                  {c.alert && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--negative)]">
                      {c.alert}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight nums truncate">
                  {c.value}
                </div>
                <div className="mt-0.5 text-xs text-muted truncate">
                  {c.sublabel}
                </div>
              </div>
              {isLowStock && onLowStockClick && (
                <ChevronRight size={14} className="text-muted shrink-0 mt-1" />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
