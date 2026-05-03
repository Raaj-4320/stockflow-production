export type StockState = "in_stock" | "low_stock" | "out_of_stock";

export interface VariantCell {
  variant: string; // e.g. "M", "L", or NO_VARIANT
  color: string; // e.g. "Red", or NO_COLOR
  stock: number;
  buyPrice: number;
  sellPrice: number;
}

export interface PurchaseHistoryEntry {
  id: string;
  date: string; // ISO
  party: string;
  qty: number;
  unitCost: number;
  amountPaid: number;
  paymentMethod?: "cash" | "upi" | "bank" | "credit";
  prevBuyPrice: number;
  newBuyPrice: number;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  imageUrl?: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  lowStockThreshold: number;
  totalSold?: number;
  totalPurchased?: number;
  hasVariants: boolean;
  variants?: string[]; // ["S", "M", "L"]
  colors?: string[]; // ["Red", "Blue"]
  matrix?: VariantCell[];
  history?: PurchaseHistoryEntry[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
}

export interface PurchaseParty {
  id: string;
  name: string;
  phone?: string;
}

export const NO_VARIANT = "__NO_VARIANT__";
export const NO_COLOR = "__NO_COLOR__";

export type SortKey =
  | "name_asc"
  | "name_desc"
  | "stock_asc"
  | "stock_desc"
  | "value_desc"
  | "recent";

export interface InventoryFilters {
  search: string;
  category: string; // "all" or category name
  stockStates: StockState[];
  sort: SortKey;
}

export const stockStateFor = (p: Product): StockState => {
  if (p.stock <= 0) return "out_of_stock";
  if (p.stock <= p.lowStockThreshold) return "low_stock";
  return "in_stock";
};
