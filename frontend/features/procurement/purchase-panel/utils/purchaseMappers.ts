import type {
  PurchaseOrder,
  OrderFilters,
  WizardDraft,
  OrderLineItem,
  Product,
  NewProductDraft,
} from "../types";

// ─── Filter & Sort Orders ─────────────────────────────────────────────────────

export function filterAndSortOrders(
  orders: PurchaseOrder[],
  filters: OrderFilters
): PurchaseOrder[] {
  let result = [...orders];

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.partyName.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (filters.status !== "all") {
    result = result.filter((o) => o.status === filters.status);
  }

  // Sort
  result.sort((a, b) => {
    let valA: string | number;
    let valB: string | number;

    switch (filters.sortField) {
      case "createdAt":
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
        break;
      case "totalAmount":
        valA = a.totalAmount;
        valB = b.totalAmount;
        break;
      case "partyName":
        valA = a.partyName.toLowerCase();
        valB = b.partyName.toLowerCase();
        break;
      case "status":
        valA = a.status;
        valB = b.status;
        break;
      default:
        return 0;
    }

    if (valA < valB) return filters.sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return filters.sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return result;
}

// ─── Paginate ─────────────────────────────────────────────────────────────────

export function paginateArray<T>(
  arr: T[],
  page: number,
  pageSize: number
): { items: T[]; totalPages: number; total: number } {
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = arr.slice(start, start + pageSize);
  return { items, totalPages, total };
}

// ─── Wizard → Order ───────────────────────────────────────────────────────────

export function draftToOrderPreview(
  draft: WizardDraft,
  partyName: string
): Partial<PurchaseOrder> {
  return {
    partyId: draft.partyId ?? "",
    partyName,
    status: "ordered",
    lineItems: draft.lineItems.filter(isCompleteLineItem),
    notes: draft.notes,
  };
}

function isCompleteLineItem(
  item: Partial<OrderLineItem> & { id: string }
): item is OrderLineItem {
  return (
    !!item.productId &&
    !!item.variantId &&
    typeof item.quantity === "number" &&
    item.quantity > 0 &&
    typeof item.unitCost === "number" &&
    item.unitCost > 0
  );
}

// ─── New Product → Variants ───────────────────────────────────────────────────

export function newProductDraftToVariants(
  draft: NewProductDraft,
  productId: string
): OrderLineItem[] {
  return draft.variants.map((v, i) => ({
    id: `new-${productId}-${i}`,
    productId,
    productName: draft.name,
    variantId: `new-variant-${i}`,
    variantName: v.name || `Variant ${i + 1}`,
    sku: v.sku,
    quantity: 0,
    unitCost: 0,
    gstPercent: 0,
    isNewProduct: true,
  }));
}

// ─── Product → Line Items ─────────────────────────────────────────────────────

export function variantsToLineItems(
  product: Product,
  selectedVariantIds: string[]
): Array<Partial<OrderLineItem> & { id: string }> {
  return product.variants
    .filter((v) => selectedVariantIds.includes(v.id))
    .map((v) => ({
      id: `li-${v.id}`,
      productId: product.id,
      productName: product.name,
      variantId: v.id,
      variantName: v.name,
      sku: v.sku,
      quantity: 0,
      unitCost: v.currentBuyPrice,
      gstPercent: 0,
    }));
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
