"use client";

import { useMemo, useState } from "react";
import { useAdminInventoryData } from "./hooks/useAdminInventoryData";
import { useInventoryFilters } from "./hooks/useInventoryFilters";
import { computeMetrics, fmt } from "./utils/inventoryMetrics";
import { stockStateFor } from "./types";
import type { Product } from "./types";

import { AdminInventoryStats } from "./components/AdminInventoryStats";
import { AdminInventoryActionBar } from "./components/AdminInventoryActionBar";
import { AdminInventoryToolbar } from "./components/AdminInventoryToolbar";
import { AdminCategoryPills } from "./components/AdminCategoryPills";
import { AdminInventoryTable } from "./components/AdminInventoryTable";
import { AdminBulkActionBar } from "./components/AdminBulkActionBar";
import { InventoryPagination } from "./components/InventoryPagination";

import { AdminProductEditorModal } from "./components/AdminProductEditorModal";
import { AdminCategoryManagerModal } from "./components/AdminCategoryManagerModal";
import { AdminBarcodeModal } from "./components/AdminBarcodeModal";
import { AdminPurchaseModal } from "./components/AdminPurchaseModal";
import { AdminLowStockModal } from "./components/AdminLowStockModal";
import {
  AdminImportModal,
  AdminExportModal,
} from "./components/AdminDataIOModals";
import { ConfirmDialog } from "../../shared/components/ui/Modal";
import { Card } from "../../shared/components/ui/Card";
import { Package } from "lucide-react";
import { Badge } from "../../shared/components/ui/Badge";

export function AdminInventoryPage() {
  const data = useAdminInventoryData();
  const [view, setView] = useState<"table" | "card">("table");

  const filters = useInventoryFilters(data.products);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allOnPage = filters.paginated.every((p) => selectedIds.has(p.id));
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPage) filters.paginated.forEach((p) => next.delete(p.id));
      else filters.paginated.forEach((p) => next.add(p.id));
      return next;
    });
  };
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const clearSelection = () => setSelectedIds(new Set());

  const metrics = useMemo(() => computeMetrics(data.products), [data.products]);

  // Modals
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [purchaseProduct, setPurchaseProduct] = useState<Product | null>(null);
  const [lowOpen, setLowOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<{
    ids: string[];
    label: string;
  } | null>(null);

  const handleAddProduct = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const handleEditProduct = (p: Product) => {
    setEditing(p);
    setEditorOpen(true);
  };
  const handleDeleteProduct = (p: Product) =>
    setConfirmDel({ ids: [p.id], label: p.name });
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmDel({
      ids: [...selectedIds],
      label: `${selectedIds.size} products`,
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-6 max-w-[1600px] mx-auto space-y-4">
      {/* 1) KPI cards */}
      <AdminInventoryStats
        metrics={metrics}
        onLowStockClick={() => setLowOpen(true)}
      />

      {/* 2) Action row (no tabs) */}
      <AdminInventoryActionBar
        view={view}
        onViewChange={setView}
        onExport={() => setExportOpen(true)}
        onAddPurchase={() => setPurchaseProduct(data.products[0] ?? null)}
        onAddProduct={handleAddProduct}
        onAddCategory={() => setCatOpen(true)}
        onManageCategories={() => setCatOpen(true)}
      />

      {/* 3) Search / Sort / Bulk / Filters */}
      <AdminInventoryToolbar
        search={filters.filters.search}
        onSearch={filters.setSearch}
        sort={filters.filters.sort}
        onSort={filters.setSort}
        selectedCount={selectedIds.size}
        onBulkAction={(a) => {
          if (a === "delete") handleBulkDelete();
          if (a === "export") setExportOpen(true);
        }}
        onMoreFilters={() => filters.reset()}
      />

      {/* 4) Categories — horizontal pill bar */}
      <AdminCategoryPills
        categories={data.categories}
        totalCount={data.products.length}
        active={filters.filters.category}
        onSelect={(c) => {
          filters.setCategory(c);
          clearSelection();
        }}
      />

      {/* 5) Table panel — full width now (no left filters sidebar) */}
      <div className="panel p-3 sm:p-4">
        <AdminBulkActionBar
          count={selectedIds.size}
          onUpdateStock={() => {}}
          onUpdatePrice={() => {}}
          onExport={() => setExportOpen(true)}
          onDelete={handleBulkDelete}
          onClear={clearSelection}
        />

        {view === "table" ? (
          <AdminInventoryTable
            products={filters.paginated}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            allSelected={filters.paginated.length > 0 && allOnPage}
            onView={handleEditProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onBarcode={(p) => setBarcodeProduct(p)}
            onAddPurchase={(p) => setPurchaseProduct(p)}
            onHistory={(p) => setPurchaseProduct(p)}
          />
        ) : (
          <CardGrid
            products={filters.paginated}
            onEdit={handleEditProduct}
            onAddPurchase={(p) => setPurchaseProduct(p)}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
          />
        )}

        <InventoryPagination
          page={filters.page}
          totalPages={filters.totalPages}
          total={filters.filtered.length}
          pageSize={filters.pageSize}
          onPageChange={filters.setPage}
          onPageSizeChange={filters.setPageSize}
        />
      </div>

      {/* Modals */}
      <AdminProductEditorModal
        open={editorOpen}
        product={editing}
        categories={data.categories}
        variantsMaster={data.variantsMaster}
        colorsMaster={data.colorsMaster}
        onClose={() => setEditorOpen(false)}
        onSubmit={(p) => data.upsertProduct(p)}
      />

      <AdminCategoryManagerModal
        open={catOpen}
        onClose={() => setCatOpen(false)}
        categories={data.categories}
        onAdd={data.addCategory}
        onRename={data.renameCategory}
        onDelete={data.deleteCategory}
      />

      <AdminBarcodeModal
        open={!!barcodeProduct}
        product={barcodeProduct}
        storeName="Stockflow Store"
        onClose={() => setBarcodeProduct(null)}
      />

      <AdminPurchaseModal
        open={!!purchaseProduct}
        product={purchaseProduct}
        parties={data.parties}
        onClose={() => setPurchaseProduct(null)}
        onSubmit={data.postPurchase}
      />

      <AdminLowStockModal
        open={lowOpen}
        products={data.products}
        onClose={() => setLowOpen(false)}
        onAddPurchase={(p) => {
          setLowOpen(false);
          setPurchaseProduct(p);
        }}
        onExport={() => setExportOpen(true)}
      />

      <AdminImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={() => {}}
      />

      <AdminExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        products={
          selectedIds.size > 0
            ? data.products.filter((p) => selectedIds.has(p.id))
            : data.products
        }
      />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => {
          if (confirmDel) {
            data.deleteProducts(confirmDel.ids);
            clearSelection();
            setConfirmDel(null);
          }
        }}
        title="Delete products?"
        description={
          confirmDel
            ? `This will permanently remove ${confirmDel.label}. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
      />
    </div>
  );
}

function CardGrid({
  products,
  onEdit,
  onAddPurchase,
  selectedIds,
  onToggleRow,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onAddPurchase: (p: Product) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {products.map((p) => {
        const s = stockStateFor(p);
        const tone =
          s === "in_stock"
            ? "text-[var(--positive)]"
            : s === "low_stock"
            ? "text-[var(--warning)]"
            : "text-[var(--negative)]";
        const selected = selectedIds.has(p.id);
        return (
          <Card
            key={p.id}
            padding="md"
            className={
              selected
                ? "ring-1 ring-[var(--positive-border)] bg-[var(--positive-bg)]"
                : ""
            }
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleRow(p.id)}
                className="mt-1 w-4 h-4 accent-[var(--positive)]"
              />
              <div className="w-10 h-10 rounded-md bg-surface-active grid place-items-center shrink-0 text-faint">
                <Package size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted">{p.sku}</div>
              </div>
              <Badge tone="subtle">{p.category}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-subtle">
              <Mini label="Stock" value={String(p.stock)} className={tone} />
              <Mini label="Buy" value={fmt(p.buyPrice)} />
              <Mini label="Sell" value={fmt(p.sellPrice)} />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEdit(p)}
                className="flex-1 h-8 rounded-md text-xs font-medium bg-surface hover:bg-surface-hover"
              >
                Edit
              </button>
              <button
                onClick={() => onAddPurchase(p)}
                className="flex-1 h-8 rounded-md text-xs font-medium text-[var(--positive)] bg-[var(--positive-bg)] hover:opacity-90"
              >
                + Purchase
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Mini({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <div className="text-2xs uppercase tracking-wider text-muted">{label}</div>
      <div className={`text-sm font-medium nums mt-0.5 ${className}`}>
        {value}
      </div>
    </div>
  );
}
