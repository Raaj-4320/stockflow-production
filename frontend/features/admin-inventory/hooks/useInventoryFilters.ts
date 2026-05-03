"use client";

import { useMemo, useState } from "react";
import type { InventoryFilters, Product, SortKey, StockState } from "../types";
import { stockStateFor } from "../types";

const DEFAULTS: InventoryFilters = {
  search: "",
  category: "all",
  stockStates: [],
  sort: "recent",
};

export function useInventoryFilters(products: Product[]) {
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULTS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const setSearch = (search: string) => {
    setFilters((f) => ({ ...f, search }));
    setPage(1);
  };
  const setCategory = (category: string) => {
    setFilters((f) => ({ ...f, category }));
    setPage(1);
  };
  const toggleStockState = (s: StockState) =>
    setFilters((f) => {
      const has = f.stockStates.includes(s);
      return {
        ...f,
        stockStates: has
          ? f.stockStates.filter((x) => x !== s)
          : [...f.stockStates, s],
      };
    });
  const setSort = (sort: SortKey) => setFilters((f) => ({ ...f, sort }));
  const reset = () => {
    setFilters(DEFAULTS);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const out = products.filter((p) => {
      if (filters.category !== "all" && p.category !== filters.category)
        return false;
      if (filters.stockStates.length > 0) {
        const s = stockStateFor(p);
        if (!filters.stockStates.includes(s)) return false;
      }
      if (q) {
        const hay = `${p.name} ${p.sku} ${p.barcode ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out.sort((a, b) => {
      switch (filters.sort) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "stock_asc":
          return a.stock - b.stock;
        case "stock_desc":
          return b.stock - a.stock;
        case "value_desc":
          return b.buyPrice * b.stock - a.buyPrice * a.stock;
        case "recent":
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return out;
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  return {
    filters,
    filtered,
    paginated,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    setSearch,
    setCategory,
    toggleStockState,
    setSort,
    reset,
  };
}
