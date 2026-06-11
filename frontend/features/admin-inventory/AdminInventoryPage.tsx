"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { AdminProductPickerModal } from "./components/AdminProductPickerModal";
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

  // Show ALL products (no pagination cap). We still allow page-size for large
  // catalogs but default to all-on-one-page so nothing is "hidden".
  const filters = useInventoryFilters(data.products);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // The list rendered in the table is the current page slice; "select all"
  // toggles every row on the current page (the standard table convention).
  const visible = filters.paginated;
  const allOnPage =
    visible.length > 0 && visible.every((p) => selectedIds.has(p.id));
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPage) visible.forEach((p) => next.delete(p.id));
      else visible.forEach((p) => next.add(p.id));
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

  // Measure the sticky search cluster so the product panel can pin to it
  // exactly. ResizeObserver keeps it correct when the cluster wraps on
  // narrow viewports.
  const stickyClusterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = stickyClusterRef.current;
    if (!node) return;
    const apply = (h: number) => {
      document.documentElement.style.setProperty(
        "--sticky-products-top",
        `${Math.ceil(h)}px`
      );
    };
    apply(node.getBoundingClientRect().height);
    // contentRect excludes padding — re-measure via getBoundingClientRect
    // so the panel's sticky offset includes the cluster's full padded height.
    const ro = new ResizeObserver(() => {
      apply(node.getBoundingClientRect().height);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Modals
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [purchaseProduct, setPurchaseProduct] = useState<Product | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
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
    <div className="px-4 sm:px-6 lg:px-8 pt-5 lg:pt-6 max-w-[1600px] mx-auto space-y-4">
      {/* 1) KPI cards — scrolls away with the page */}
      <AdminInventoryStats
        metrics={metrics}
        onLowStockClick={() => setLowOpen(true)}
      />

      {/* 2) Action row — also scrolls away */}
      <AdminInventoryActionBar
        view={view}
        onViewChange={setView}
        onExport={() => setExportOpen(true)}
        onAddPurchase={() => setPickerOpen(true)}
        onAddProduct={handleAddProduct}
        onAddCategory={() => setCatOpen(true)}
      />

      {/*
        3) Sticky cluster — search row + categories pills.
        Stays glued to the top once the user scrolls past the action row.
        Negative margins + matching padding give it a full-bleed background
        so page content scrolling underneath doesn't bleed through.
      */}
      <div
        ref={stickyClusterRef}
        // pt-0 here removes the extra top padding that combined with the
        // wrapper's space-y-4 margin was producing a visible double-gap
        // between the action row and the search field. The bottom padding
        // (pb-3) is kept so the categories pills don't hug the border-b.
        className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-0 pb-3 bg-bg/85 backdrop-blur-md border-b border-subtle space-y-3"
      >
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
        <AdminCategoryPills
          categories={data.categories}
          totalCount={data.products.length}
          active={filters.filters.category}
          onSelect={(c) => {
            filters.setCategory(c);
            clearSelection();
          }}
        />
      </div>

      {/*
        4) Product details panel.

        Behavior the user asked for:
          - Panel itself sticks to the bottom edge of the sticky search bar
            once the page scrolls past it ("scrolls up only to the screen end").
          - Panel ALWAYS stretches to the bottom of the viewport. New rows
            don't push the panel off-screen — they appear inside the panel's
            scrollable list region.
          - The bulk-action bar and the footer summary stay pinned at the
            top / bottom of the panel. Only the table region scrolls.
          - The page itself only scrolls until the search bar reaches the
            top — after that the panel takes over.

        Sidebar sticky-positioning is handled in <Sidebar> (h-screen sticky
        top-0) and remains glued to the viewport while the user scrolls
        through products.

        --sticky-products-top is approx. height of the sticky cluster
        (search row + categories pills + paddings).
      */}
      <div
        className="panel p-3 sm:p-4 flex flex-col sticky"
        style={{
          top: "var(--sticky-products-top, 132px)",
          height: "calc(100vh - var(--sticky-products-top, 132px))",
          minHeight: "420px",
        }}
      >
        <AdminBulkActionBar
          count={selectedIds.size}
          onUpdateStock={() => {}}
          onUpdatePrice={() => {}}
          onExport={() => setExportOpen(true)}
          onDelete={handleBulkDelete}
          onClear={clearSelection}
        />

        <div className="flex-1 min-h-0 overflow-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
          {view === "table" ? (
            <AdminInventoryTable
              products={visible}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              allSelected={allOnPage}
              onView={handleEditProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onBarcode={(p) => setBarcodeProduct(p)}
              onAddPurchase={(p) => setPurchaseProduct(p)}
              onHistory={(p) => setPurchaseProduct(p)}
            />
          ) : (
            <CardGrid
              products={visible}
              onEdit={handleEditProduct}
              onAddPurchase={(p) => setPurchaseProduct(p)}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
            />
          )}
        </div>

        <div className="shrink-0">
          <InventoryPagination
            page={filters.page}
            totalPages={filters.totalPages}
            total={filters.filtered.length}
            pageSize={filters.pageSize}
            onPageChange={filters.setPage}
            onPageSizeChange={filters.setPageSize}
          />
        </div>
      </div>

      {/*
        Sticky-pin buffer: extends the page wrapper's content height so
        `position: sticky` on the product panel above has enough room
        in its containing block to stay pinned ALL the way to the
        viewport bottom — even at max page scroll. Without this, sticky
        would release ~30-50px early at the end of the scroll.

        Using a real child (not padding-bottom) is required because
        the sticky containing block uses the parent's CONTENT area,
        not its padding box.
      */}
      <div
        aria-hidden
        className="shrink-0"
        style={{
          height: "100vh",
        }}
      />

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

      <AdminProductPickerModal
        open={pickerOpen}
        products={data.products}
        onClose={() => setPickerOpen(false)}
        onPick={(product) => {
          setPickerOpen(false);
          setPurchaseProduct(product);
        }}
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
              <div className="w-10 h-10 rounded-md bg-surface-active grid place-items-center shrink-0 text-faint overflow-hidden">
                {p.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={16} />
                )}
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
