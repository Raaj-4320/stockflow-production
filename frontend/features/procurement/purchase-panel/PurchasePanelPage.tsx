"use client";

import { useState } from "react";
import type { PurchaseOrder, ReceiveMethod } from "./types";
import { usePurchasePanelData } from "./hooks/usePurchasePanelData";
import { PurchasePanelHeader } from "./components/PurchasePanelHeader";
import { PurchaseOrdersToolbar } from "./components/PurchaseOrdersToolbar";
import { PurchaseOrderList } from "./components/PurchaseOrderList";
import { PurchaseOrderPagination } from "./components/PurchaseOrderPagination";
import { PurchasePartySection } from "./components/PurchasePartySection";
import { PurchaseImportDialog } from "./components/PurchaseImportDialog";
import { PurchaseOrderWizard } from "./PurchaseOrderWizard/PurchaseOrderWizard";
import { ReceiveOrderDialog } from "./PurchaseOrderWizard/ReceiveOrderDialog";

export function PurchasePanelPage() {
  const {
    orders,
    parties,
    products,
    isLoading,
    filters,
    page,
    totalPages,
    total,
    pageSize,
    setFilters,
    setPage,
    addOrder,
    addParty,
    updateParty,
    deleteParty,
    receiveOrder,
  } = usePurchasePanelData();

  const [activeTab, setActiveTab] = useState("orders");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);

  const handleCreateOrder = () => setWizardOpen(true);

  const handleEditOrder = (order: PurchaseOrder) => {
    // In a real app, open wizard with pre-filled data
    console.log("Edit order:", order.id);
  };

  const handleReceiveOrder = (order: PurchaseOrder) => {
    setReceivingOrder(order);
  };

  const handleConfirmReceive = (_orderId: string, _method: ReceiveMethod) => {
    receiveOrder(_orderId);
    setReceivingOrder(null);
  };

  const handleDownload = () => {
    // Mock download
    const data = JSON.stringify(orders, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase_orders.json";
    a.click();
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header with tabs */}
      <PurchasePanelHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main className="page-container py-6">
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Toolbar */}
            <PurchaseOrdersToolbar
              filters={filters}
              onFiltersChange={setFilters}
              total={total}
              onCreateOrder={handleCreateOrder}
              onImport={() => setImportOpen(true)}
              onDownload={handleDownload}
            />

            {/* Orders list */}
            <PurchaseOrderList
              orders={orders}
              isLoading={isLoading}
              onEdit={handleEditOrder}
              onReceive={handleReceiveOrder}
              onCreateOrder={handleCreateOrder}
            />

            {/* Pagination */}
            {!isLoading && (
              <PurchaseOrderPagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            )}
          </div>
        )}

        {activeTab === "parties" && (
          <PurchasePartySection
            parties={parties}
            isLoading={isLoading}
            onAddParty={addParty}
            onUpdateParty={updateParty}
            onDeleteParty={deleteParty}
          />
        )}
      </main>

      {/* Modals */}
      <PurchaseOrderWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSubmit={(order) => {
          addOrder(order);
          setWizardOpen(false);
        }}
        parties={parties}
        products={products}
      />

      <ReceiveOrderDialog
        order={receivingOrder}
        open={receivingOrder !== null}
        onClose={() => setReceivingOrder(null)}
        onConfirm={handleConfirmReceive}
      />

      <PurchaseImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}
