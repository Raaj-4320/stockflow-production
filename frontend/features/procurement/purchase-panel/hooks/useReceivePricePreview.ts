"use client";

import { useState, useMemo } from "react";
import type {
  PurchaseOrder,
  ReceiveMethod,
  ReceivePreviewRow,
  ProductVariant,
} from "../types";
import { computeReceivePreview } from "../utils/purchaseCalculations";
import { MOCK_PRODUCTS } from "../mockData";

export function useReceivePricePreview(order: PurchaseOrder | null) {
  const [method, setMethod] = useState<ReceiveMethod>("weighted_average");

  // Flatten all variants for lookup
  const allVariants = useMemo((): ProductVariant[] => {
    return MOCK_PRODUCTS.flatMap((p) => p.variants);
  }, []);

  const previewRows = useMemo((): ReceivePreviewRow[] => {
    if (!order) return [];
    return computeReceivePreview(order.lineItems, allVariants, method);
  }, [order, allVariants, method]);

  const summary = useMemo(() => {
    const increases = previewRows.filter((r) => r.changeType === "increase").length;
    const decreases = previewRows.filter((r) => r.changeType === "decrease").length;
    const unchanged = previewRows.filter((r) => r.changeType === "no_change").length;
    return { increases, decreases, unchanged, total: previewRows.length };
  }, [previewRows]);

  return {
    method,
    setMethod,
    previewRows,
    summary,
  };
}
