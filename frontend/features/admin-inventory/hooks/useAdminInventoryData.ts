"use client";

import { useCallback, useState } from "react";
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_PARTIES,
  MOCK_VARIANTS_MASTER,
  MOCK_COLORS_MASTER,
} from "../mockData";
import type {
  Product,
  Category,
  PurchaseHistoryEntry,
  PurchaseParty,
} from "../types";
import { weightedBuyPrice } from "../utils/inventoryMetrics";

let _id = 1000;
const nextId = () => `${++_id}`;

export function useAdminInventoryData() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [variantsMaster, setVariantsMaster] =
    useState<string[]>(MOCK_VARIANTS_MASTER);
  const [colorsMaster, setColorsMaster] = useState<string[]>(MOCK_COLORS_MASTER);
  const [parties, setParties] = useState<PurchaseParty[]>(MOCK_PARTIES);

  const upsertProduct = useCallback((p: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx === -1) return [{ ...p, id: p.id || nextId() }, ...prev];
      const copy = [...prev];
      copy[idx] = p;
      return copy;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const deleteProducts = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setProducts((prev) => prev.filter((p) => !set.has(p.id)));
  }, []);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.find((c) => c.name === trimmed)
        ? prev
        : [...prev, { id: nextId(), name: trimmed, productCount: 0 }]
    );
  }, []);

  const renameCategory = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.map((c) => (c.name === oldName ? { ...c, name: trimmed } : c))
    );
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p))
    );
  }, []);

  const deleteCategory = useCallback((name: string) => {
    setCategories((prev) => prev.filter((c) => c.name !== name));
    // products stay but category becomes orphan; in real app reassign to "Others"
    setProducts((prev) =>
      prev.map((p) => (p.category === name ? { ...p, category: "Others" } : p))
    );
  }, []);

  const addVariantMaster = useCallback((token: string) => {
    const t = token.trim();
    if (!t) return;
    setVariantsMaster((prev) => (prev.includes(t) ? prev : [...prev, t]));
  }, []);

  const addColorMaster = useCallback((token: string) => {
    const t = token.trim();
    if (!t) return;
    setColorsMaster((prev) => (prev.includes(t) ? prev : [...prev, t]));
  }, []);

  const ensureParty = useCallback(
    (name: string): PurchaseParty => {
      const trimmed = name.trim();
      const existing = parties.find(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (existing) return existing;
      const created: PurchaseParty = { id: nextId(), name: trimmed };
      setParties((prev) => [created, ...prev]);
      return created;
    },
    [parties]
  );

  const postPurchase = useCallback(
    ({
      productId,
      qty,
      unitCost,
      partyName,
      amountPaid,
      paymentMethod,
      note,
    }: {
      productId: string;
      qty: number;
      unitCost: number;
      partyName: string;
      amountPaid: number;
      paymentMethod?: PurchaseHistoryEntry["paymentMethod"];
      note?: string;
    }) => {
      ensureParty(partyName);

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const prevBuy = p.buyPrice;
          const newBuy = weightedBuyPrice(p.stock, p.buyPrice, qty, unitCost);
          const entry: PurchaseHistoryEntry = {
            id: nextId(),
            date: new Date().toISOString().slice(0, 10),
            party: partyName.trim(),
            qty,
            unitCost,
            amountPaid,
            paymentMethod,
            prevBuyPrice: prevBuy,
            newBuyPrice: newBuy,
            note,
          };
          return {
            ...p,
            stock: p.stock + qty,
            totalPurchased: (p.totalPurchased ?? p.stock) + qty,
            buyPrice: newBuy,
            history: [entry, ...(p.history ?? [])],
          };
        })
      );
    },
    [ensureParty]
  );

  return {
    products,
    categories,
    variantsMaster,
    colorsMaster,
    parties,
    upsertProduct,
    deleteProduct,
    deleteProducts,
    addCategory,
    renameCategory,
    deleteCategory,
    addVariantMaster,
    addColorMaster,
    ensureParty,
    postPurchase,
  };
}
