"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  PurchaseOrder,
  Party,
  Product,
  OrderFilters,
  OrderStatus,
} from "../types";
import { MOCK_ORDERS, MOCK_PARTIES, MOCK_PRODUCTS } from "../mockData";
import { filterAndSortOrders, paginateArray } from "../utils/purchaseMappers";

const PAGE_SIZE = 6;

const DEFAULT_FILTERS: OrderFilters = {
  search: "",
  status: "all",
  sortField: "createdAt",
  sortDirection: "desc",
};

export function usePurchasePanelData() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & pagination
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // Load mock data with simulated delay
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setOrders(MOCK_ORDERS);
      setParties(MOCK_PARTIES);
      setProducts(MOCK_PRODUCTS);
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Filtered & sorted orders
  const filteredOrders = useMemo(
    () => filterAndSortOrders(orders, filters),
    [orders, filters]
  );

  // Paginated
  const { items: pagedOrders, totalPages, total } = useMemo(
    () => paginateArray(filteredOrders, page, PAGE_SIZE),
    [filteredOrders, page]
  );

  // Status counts for filter UI
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    }
    return counts;
  }, [orders]);

  // CRUD stubs (mock)
  const addOrder = useCallback((order: PurchaseOrder) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrder = useCallback((updated: PurchaseOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const addParty = useCallback((party: Party) => {
    setParties((prev) => [party, ...prev]);
  }, []);

  const updateParty = useCallback((updated: Party) => {
    setParties((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }, []);

  const deleteParty = useCallback((id: string) => {
    setParties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const receiveOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "received" as OrderStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
  }, []);

  return {
    // Data
    orders: pagedOrders,
    allOrders: orders,
    parties,
    products,

    // State
    isLoading,
    error,
    filters,
    page,
    totalPages,
    total,
    statusCounts,
    pageSize: PAGE_SIZE,

    // Actions
    setFilters,
    setPage,
    refresh: loadData,
    addOrder,
    updateOrder,
    deleteOrder,
    addParty,
    updateParty,
    deleteParty,
    receiveOrder,
  };
}
