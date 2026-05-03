import type {
  OrderLineItem,
  OrderLineItemComputed,
  ReceivePreviewRow,
  ReceiveMethod,
  ProductVariant,
} from "../types";

// ─── Line Item ────────────────────────────────────────────────────────────────

export function computeLineItem(item: OrderLineItem): OrderLineItemComputed {
  const lineSubtotal = item.quantity * item.unitCost;
  const lineGst = lineSubtotal * (item.gstPercent / 100);
  const lineTotal = lineSubtotal + lineGst;
  return { ...item, lineSubtotal, lineGst, lineTotal };
}

export function computeGrandTotal(items: OrderLineItem[]): {
  subtotal: number;
  totalGst: number;
  grandTotal: number;
} {
  let subtotal = 0;
  let totalGst = 0;
  for (const item of items) {
    const computed = computeLineItem(item);
    subtotal += computed.lineSubtotal;
    totalGst += computed.lineGst;
  }
  return { subtotal, totalGst, grandTotal: subtotal + totalGst };
}

// ─── Receive Preview ──────────────────────────────────────────────────────────

export function computeReceivePreview(
  lineItems: OrderLineItem[],
  variants: ProductVariant[],
  method: ReceiveMethod
): ReceivePreviewRow[] {
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  return lineItems.map((item) => {
    const variant = variantMap.get(item.variantId);
    const currentBuyPrice = variant?.currentBuyPrice ?? 0;
    const currentStock = variant?.currentStock ?? 0;
    const newUnitCost = item.unitCost;

    let newBuyPrice: number;

    switch (method) {
      case "no_change":
        newBuyPrice = currentBuyPrice;
        break;

      case "weighted_average": {
        const totalUnits = currentStock + item.quantity;
        if (totalUnits === 0) {
          newBuyPrice = newUnitCost;
        } else {
          newBuyPrice =
            (currentBuyPrice * currentStock + newUnitCost * item.quantity) /
            totalUnits;
        }
        break;
      }

      case "override":
        newBuyPrice = newUnitCost;
        break;

      case "last_cost":
        newBuyPrice = newUnitCost;
        break;

      default:
        newBuyPrice = currentBuyPrice;
    }

    newBuyPrice = Math.round(newBuyPrice * 100) / 100;

    const diff = newBuyPrice - currentBuyPrice;
    const changeType =
      diff > 0 ? "increase" : diff < 0 ? "decrease" : "no_change";
    const changePercent =
      currentBuyPrice > 0
        ? Math.round((diff / currentBuyPrice) * 10000) / 100
        : 0;

    return {
      variantId: item.variantId,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      currentBuyPrice,
      newBuyPrice,
      changeType,
      changePercent,
    };
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface LineItemValidationError {
  itemId: string;
  field: "quantity" | "unitCost" | "gstPercent";
  message: string;
}

export function validateLineItems(
  items: Array<Partial<OrderLineItem> & { id: string }>
): LineItemValidationError[] {
  const errors: LineItemValidationError[] = [];

  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      errors.push({
        itemId: item.id,
        field: "quantity",
        message: "Quantity must be greater than 0",
      });
    }
    if (!item.unitCost || item.unitCost <= 0) {
      errors.push({
        itemId: item.id,
        field: "unitCost",
        message: "Unit cost must be greater than 0",
      });
    }
    if (
      item.gstPercent !== undefined &&
      (item.gstPercent < 0 || item.gstPercent > 100)
    ) {
      errors.push({
        itemId: item.id,
        field: "gstPercent",
        message: "GST must be between 0% and 100%",
      });
    }
  }

  return errors;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatPercent(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
