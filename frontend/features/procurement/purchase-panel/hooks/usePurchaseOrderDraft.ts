"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  WizardDraft,
  SourceMode,
  NewProductDraft,
  OrderLineItem,
  Product,
} from "../types";
import {
  variantsToLineItems,
  newProductDraftToVariants,
} from "../utils/purchaseMappers";
import {
  validateLineItems,
  computeGrandTotal,
} from "../utils/purchaseCalculations";

const TOTAL_STEPS = 5;

const INITIAL_DRAFT: WizardDraft = {
  currentStep: 0,
  sourceMode: null,
  partyId: null,
  selectedProductId: null,
  selectedVariantIds: [],
  newProductDraft: null,
  lineItems: [],
  notes: "",
};

export function usePurchaseOrderDraft() {
  const [draft, setDraft] = useState<WizardDraft>(INITIAL_DRAFT);
  const [isDirty, setIsDirty] = useState(false);

  const update = useCallback((partial: Partial<WizardDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setIsDirty(true);
  }, []);

  // ─── Step Navigation ────────────────────────────────────────────────────────

  const canGoNext = useMemo((): boolean => {
    switch (draft.currentStep) {
      case 0: // Source
        return draft.sourceMode !== null;
      case 1: // Product
        if (draft.sourceMode === "inventory") {
          return draft.selectedProductId !== null;
        }
        return (
          (draft.newProductDraft?.name?.trim()?.length ?? 0) > 0 &&
          (draft.newProductDraft?.variants?.length ?? 0) > 0
        );
      case 2: // Variants
        if (draft.sourceMode === "inventory") {
          return draft.selectedVariantIds.length > 0;
        }
        return true;
      case 3: // Pricing
        return (
          draft.lineItems.length > 0 &&
          validateLineItems(draft.lineItems).length === 0
        );
      case 4: // Review
        return draft.partyId !== null;
      default:
        return false;
    }
  }, [draft]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    setDraft((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS - 1),
    }));
  }, [canGoNext]);

  const goBack = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setDraft((prev) => ({ ...prev, currentStep: step }));
  }, []);

  // ─── Source Selection ────────────────────────────────────────────────────────

  const setSourceMode = useCallback(
    (mode: SourceMode) => {
      update({
        sourceMode: mode,
        selectedProductId: null,
        selectedVariantIds: [],
        newProductDraft: null,
        lineItems: [],
      });
    },
    [update]
  );

  // ─── Product Selection ───────────────────────────────────────────────────────

  const selectProduct = useCallback(
    (product: Product) => {
      update({
        selectedProductId: product.id,
        selectedVariantIds: [],
        lineItems: [],
      });
    },
    [update]
  );

  const setNewProductDraft = useCallback(
    (draft: NewProductDraft) => {
      update({ newProductDraft: draft });
    },
    [update]
  );

  // ─── Variant Selection ───────────────────────────────────────────────────────

  const toggleVariant = useCallback(
    (variantId: string, product: Product) => {
      setDraft((prev) => {
        const isSelected = prev.selectedVariantIds.includes(variantId);
        const newIds = isSelected
          ? prev.selectedVariantIds.filter((id) => id !== variantId)
          : [...prev.selectedVariantIds, variantId];

        const lineItems = variantsToLineItems(product, newIds);
        return { ...prev, selectedVariantIds: newIds, lineItems, isDirty: true };
      });
      setIsDirty(true);
    },
    []
  );

  const toggleAllVariants = useCallback(
    (product: Product, selectAll: boolean) => {
      const ids = selectAll ? product.variants.map((v) => v.id) : [];
      const lineItems = variantsToLineItems(product, ids);
      update({ selectedVariantIds: ids, lineItems });
    },
    [update]
  );

  const populateNewProductLineItems = useCallback(
    (productId: string) => {
      if (!draft.newProductDraft) return;
      const lineItems = newProductDraftToVariants(
        draft.newProductDraft,
        productId
      );
      update({ lineItems });
    },
    [draft.newProductDraft, update]
  );

  // ─── Line Item Updates ───────────────────────────────────────────────────────

  const updateLineItem = useCallback(
    (
      itemId: string,
      field: keyof Pick<OrderLineItem, "quantity" | "unitCost" | "gstPercent">,
      value: number
    ) => {
      setDraft((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  // ─── Totals ──────────────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    const validItems = draft.lineItems.filter(
      (item): item is OrderLineItem =>
        typeof item.quantity === "number" &&
        typeof item.unitCost === "number" &&
        item.quantity > 0 &&
        item.unitCost > 0
    );
    return computeGrandTotal(validItems);
  }, [draft.lineItems]);

  // ─── Validation ──────────────────────────────────────────────────────────────

  const lineItemErrors = useMemo(
    () => validateLineItems(draft.lineItems),
    [draft.lineItems]
  );

  // ─── Reset ───────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setDraft(INITIAL_DRAFT);
    setIsDirty(false);
  }, []);

  return {
    draft,
    isDirty,
    canGoNext,
    totals,
    lineItemErrors,
    totalSteps: TOTAL_STEPS,

    // Actions
    update,
    goNext,
    goBack,
    goToStep,
    setSourceMode,
    selectProduct,
    setNewProductDraft,
    toggleVariant,
    toggleAllVariants,
    populateNewProductLineItems,
    updateLineItem,
    reset,
  };
}
