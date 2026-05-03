"use client";

import { useCallback } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import type { Party, Product, PurchaseOrder } from "../types";
import { usePurchaseOrderDraft } from "../hooks/usePurchaseOrderDraft";
import { Stepper } from "../../../../shared/components/ui/Stepper";
import { Button } from "../../../../shared/components/ui/Button";
import { SourceModeStep } from "./SourceModeStep";
import { InventoryProductStep } from "./InventoryProductStep";
import { NewProductDraftStep } from "./NewProductDraftStep";
import { VariantSelectorStep } from "./VariantSelectorStep";
import { PricingMatrixStep } from "./PricingMatrixStep";
import { ReviewStep } from "./ReviewStep";
import { computeGrandTotal } from "../utils/purchaseCalculations";
import type { OrderLineItem } from "../types";

const STEPS = [
  { id: "source", label: "Source", index: 0 },
  { id: "product", label: "Product", index: 1 },
  { id: "variants", label: "Variants", index: 2 },
  { id: "pricing", label: "Pricing", index: 3 },
  { id: "review", label: "Review", index: 4 },
];

interface PurchaseOrderWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (order: PurchaseOrder) => void;
  parties: Party[];
  products: Product[];
}

export function PurchaseOrderWizard({
  open,
  onClose,
  onSubmit,
  parties,
  products,
}: PurchaseOrderWizardProps) {
  const {
    draft,
    isDirty,
    canGoNext,
    totals,
    lineItemErrors,
    update,
    goNext,
    goBack,
    setSourceMode,
    selectProduct,
    setNewProductDraft,
    toggleVariant,
    toggleAllVariants,
    updateLineItem,
    reset,
  } = usePurchaseOrderDraft();

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const selectedProduct = products.find(
    (p) => p.id === draft.selectedProductId
  );

  // Determine whether to skip variants step for new product
  const effectiveStep = draft.currentStep;
  const isNewProductFlow = draft.sourceMode === "new_product";

  const handleFinalSubmit = () => {
    const party = parties.find((p) => p.id === draft.partyId);
    if (!party) return;

    const validItems = draft.lineItems.filter(
      (item): item is OrderLineItem =>
        typeof item.quantity === "number" &&
        item.quantity > 0 &&
        typeof item.unitCost === "number" &&
        item.unitCost > 0
    );

    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      orderNumber: `PO-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 9000) + 1000
      )}`,
      partyId: party.id,
      partyName: party.name,
      status: "ordered",
      lineItems: validItems,
      totalAmount: totals.grandTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: draft.notes || undefined,
    };

    onSubmit(newOrder);
    reset();
    onClose();
  };

  if (!open) return null;

  const isLastStep = draft.currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--bg-overlay)" }}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        className={clsx(
          "relative z-10 flex flex-col w-full bg-bg-surface",
          "sm:rounded-xl sm:shadow-xl sm:border sm:border-border-subtle",
          "h-full sm:h-auto sm:max-h-[90vh]",
          "sm:max-w-2xl",
          "animate-[scaleIn_150ms_ease-out]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              New Purchase Order
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Step {draft.currentStep + 1} of {STEPS.length}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5 py-3 border-b border-border-subtle bg-bg-primary shrink-0">
          <Stepper steps={STEPS} currentStep={draft.currentStep} />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <StepContent
            step={effectiveStep}
            draft={draft}
            products={products}
            parties={parties}
            selectedProduct={selectedProduct}
            totals={totals}
            lineItemErrors={lineItemErrors}
            isNewProductFlow={isNewProductFlow}
            onSourceMode={setSourceMode}
            onSelectProduct={selectProduct}
            onNewProductDraft={setNewProductDraft}
            onToggleVariant={toggleVariant}
            onToggleAllVariants={toggleAllVariants}
            onUpdateLineItem={updateLineItem}
            onUpdateDraft={update}
          />
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border-subtle bg-bg-surface shrink-0">
          <Button
            variant="ghost"
            size="md"
            leftIcon={<ChevronLeft size={15} />}
            onClick={goBack}
            disabled={draft.currentStep === 0}
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-xs text-text-muted hidden sm:block">
                Draft saved
              </span>
            )}
            {isLastStep ? (
              <Button
                variant="primary"
                size="md"
                rightIcon={<CheckCircle2 size={15} />}
                onClick={handleFinalSubmit}
                disabled={!draft.partyId}
              >
                Create Order
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                rightIcon={<ChevronRight size={15} />}
                onClick={goNext}
                disabled={!canGoNext}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step Content Router ──────────────────────────────────────────────────────

function StepContent({
  step,
  draft,
  products,
  parties,
  selectedProduct,
  totals,
  lineItemErrors,
  isNewProductFlow,
  onSourceMode,
  onSelectProduct,
  onNewProductDraft,
  onToggleVariant,
  onToggleAllVariants,
  onUpdateLineItem,
  onUpdateDraft,
}: {
  step: number;
  draft: ReturnType<typeof usePurchaseOrderDraft>["draft"];
  products: Product[];
  parties: Party[];
  selectedProduct: Product | undefined;
  totals: ReturnType<typeof usePurchaseOrderDraft>["totals"];
  lineItemErrors: ReturnType<typeof usePurchaseOrderDraft>["lineItemErrors"];
  isNewProductFlow: boolean;
  onSourceMode: ReturnType<typeof usePurchaseOrderDraft>["setSourceMode"];
  onSelectProduct: ReturnType<typeof usePurchaseOrderDraft>["selectProduct"];
  onNewProductDraft: ReturnType<typeof usePurchaseOrderDraft>["setNewProductDraft"];
  onToggleVariant: ReturnType<typeof usePurchaseOrderDraft>["toggleVariant"];
  onToggleAllVariants: ReturnType<typeof usePurchaseOrderDraft>["toggleAllVariants"];
  onUpdateLineItem: ReturnType<typeof usePurchaseOrderDraft>["updateLineItem"];
  onUpdateDraft: ReturnType<typeof usePurchaseOrderDraft>["update"];
}) {
  switch (step) {
    case 0:
      return (
        <SourceModeStep
          selected={draft.sourceMode}
          onChange={onSourceMode}
        />
      );

    case 1:
      if (isNewProductFlow) {
        return (
          <NewProductDraftStep
            draft={draft.newProductDraft}
            onChange={onNewProductDraft}
          />
        );
      }
      return (
        <InventoryProductStep
          products={products}
          selectedId={draft.selectedProductId}
          onSelect={onSelectProduct}
        />
      );

    case 2:
      if (isNewProductFlow) {
        // Skip to pricing for new product (variants defined in step 1)
        return (
          <PricingMatrixStep
            lineItems={draft.lineItems}
            onUpdate={onUpdateLineItem}
            errors={lineItemErrors}
            totals={totals}
          />
        );
      }
      if (!selectedProduct) {
        return (
          <p className="text-sm text-text-muted text-center py-10">
            Go back and select a product first.
          </p>
        );
      }
      return (
        <VariantSelectorStep
          product={selectedProduct}
          selectedIds={draft.selectedVariantIds}
          onToggle={onToggleVariant}
          onToggleAll={onToggleAllVariants}
        />
      );

    case 3:
      return (
        <PricingMatrixStep
          lineItems={draft.lineItems}
          onUpdate={onUpdateLineItem}
          errors={lineItemErrors}
          totals={totals}
        />
      );

    case 4:
      return (
        <ReviewStep
          draft={draft}
          parties={parties}
          totals={totals}
          onUpdateDraft={onUpdateDraft}
        />
      );

    default:
      return null;
  }
}
