export type OrderStatus =
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled";

export type ReceiveMethod =
  | "no_change"
  | "weighted_average"
  | "override"
  | "last_cost";

export type SourceMode = "inventory" | "new_product";

export type WizardStepId =
  | "source"
  | "product"
  | "variants"
  | "pricing"
  | "review";

// ─── Party ────────────────────────────────────────────────────────────────────

export interface Party {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gst?: string;
  contactPerson?: string;
  address?: string;
  createdAt: string;
}

export interface PartyFormValues {
  name: string;
  phone: string;
  email: string;
  gst: string;
  contactPerson: string;
  address: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  color?: string;
  size?: string;
  currentBuyPrice: number;
  currentStock: number;
}

export interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  category: string;
  variants: ProductVariant[];
}

// ─── New Product Draft ────────────────────────────────────────────────────────

export interface NewVariantDraft {
  id: string;
  name: string;
  sku: string;
  color: string;
  size: string;
}

export interface NewProductDraft {
  name: string;
  category: string;
  variants: NewVariantDraft[];
}

// ─── Order Line Item ──────────────────────────────────────────────────────────

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  gstPercent: number;
  isNewProduct?: boolean;
}

export interface OrderLineItemComputed extends OrderLineItem {
  lineSubtotal: number;
  lineGst: number;
  lineTotal: number;
}

// ─── Purchase Order ───────────────────────────────────────────────────────────

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  partyId: string;
  partyName: string;
  status: OrderStatus;
  lineItems: OrderLineItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

export interface WizardDraft {
  currentStep: number;
  sourceMode: SourceMode | null;
  partyId: string | null;
  selectedProductId: string | null;
  selectedVariantIds: string[];
  newProductDraft: NewProductDraft | null;
  lineItems: Array<Partial<OrderLineItem> & { id: string }>;
  notes: string;
}

export interface WizardStepConfig {
  id: WizardStepId;
  label: string;
  index: number;
}

// ─── Receive ──────────────────────────────────────────────────────────────────

export interface ReceivePreviewRow {
  variantId: string;
  variantName: string;
  sku: string;
  quantity: number;
  currentBuyPrice: number;
  newBuyPrice: number;
  changeType: "increase" | "decrease" | "no_change";
  changePercent: number;
}

// ─── Filter / Sort ────────────────────────────────────────────────────────────

export type SortField = "createdAt" | "totalAmount" | "partyName" | "status";
export type SortDirection = "asc" | "desc";

export interface OrderFilters {
  search: string;
  status: OrderStatus | "all";
  sortField: SortField;
  sortDirection: SortDirection;
}
