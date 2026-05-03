import type { Product } from "../types";
import { stockStateFor } from "../types";

export const fmt = (n: number) =>
  "₹" +
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fmtCompact = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export interface InventoryMetrics {
  inventoryValue: number; // sum(buy * stock)
  investmentTillDate: number; // sum(buy * totalPurchased)
  totalProducts: number;
  categoryCount: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export function computeMetrics(products: Product[]): InventoryMetrics {
  let inventoryValue = 0;
  let investmentTillDate = 0;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  const cats = new Set<string>();

  for (const p of products) {
    inventoryValue += p.buyPrice * p.stock;
    investmentTillDate += p.buyPrice * (p.totalPurchased ?? p.stock);
    cats.add(p.category);
    const s = stockStateFor(p);
    if (s === "in_stock") inStock++;
    else if (s === "low_stock") lowStock++;
    else outOfStock++;
  }

  return {
    inventoryValue,
    investmentTillDate,
    totalProducts: products.length,
    categoryCount: cats.size,
    inStock,
    lowStock,
    outOfStock,
  };
}

/**
 * Weighted-average buy price after a purchase.
 *   newBuy = (oldStock * oldBuy + qty * unitCost) / (oldStock + qty)
 */
export function weightedBuyPrice(
  oldStock: number,
  oldBuy: number,
  qty: number,
  unitCost: number
): number {
  const denom = oldStock + qty;
  if (denom <= 0) return unitCost;
  return (oldStock * oldBuy + qty * unitCost) / denom;
}
