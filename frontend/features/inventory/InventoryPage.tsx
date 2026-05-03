"use client";

import { useMemo, useState } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  MoreHorizontal,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
} from "lucide-react";
import { PageHeader } from "../../shared/components/layout/PageHeader";
import { Card } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { Input, Select } from "../../shared/components/ui/Input";
import { Badge } from "../../shared/components/ui/Badge";
import { Tabs } from "../../shared/components/ui/Tabs";
import { Table } from "../../shared/components/ui/Table";

type StockState = "in_stock" | "low_stock" | "out_of_stock";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  state: StockState;
  cost: number;
  price: number;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Comi Secret's Clip-On Camisole Insert (Set of 3)",
    sku: "GEN-4004",
    category: "Personal",
    stock: 404,
    state: "in_stock",
    cost: 89.85,
    price: 85.0,
  },
  {
    id: "2",
    name: "10 in 1 Scissor — Green",
    sku: "GEN-0003",
    category: "Home & Kitchen",
    stock: 38,
    state: "low_stock",
    cost: 88.0,
    price: 130.0,
  },
  {
    id: "3",
    name: "13 Pockets A4 Vertical File Folder — Blue",
    sku: "GEN-4501",
    category: "Office & Stationery",
    stock: 200,
    state: "in_stock",
    cost: 50.8,
    price: 75.0,
  },
  {
    id: "4",
    name: "13 Pockets A4 Vertical File Folder — Green",
    sku: "GEN-4502",
    category: "Office & Stationery",
    stock: 200,
    state: "in_stock",
    cost: 50.8,
    price: 75.0,
  },
  {
    id: "5",
    name: "Kangaro Stapler Pin HD-10",
    sku: "GEN-1201",
    category: "Office & Stationery",
    stock: 0,
    state: "out_of_stock",
    cost: 18.0,
    price: 25.0,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Categories", count: 120 },
  { id: "office", label: "Office & Stationery", count: 24 },
  { id: "home", label: "Home & Kitchen", count: 18 },
  { id: "personal", label: "Personal", count: 16 },
  { id: "electronics", label: "Electronics", count: 14 },
  { id: "accessories", label: "Accessories", count: 12 },
  { id: "others", label: "Others", count: 36 },
];

const STOCK_FILTERS: { id: StockState; label: string; count: number }[] = [
  { id: "in_stock", label: "In Stock", count: 86 },
  { id: "low_stock", label: "Low Stock", count: 22 },
  { id: "out_of_stock", label: "Out of Stock", count: 12 },
];

const TABS = [
  { id: "all", label: "All Products" },
  { id: "low", label: "Low Stock", count: 68 },
  { id: "out", label: "Out of Stock", count: 12 },
  { id: "recent", label: "Recently Added" },
  { id: "fast", label: "Fast Moving" },
];

const STATS = [
  {
    label: "Inventory Value (Cost)",
    value: "₹2,375,340.23",
    sublabel: "Total cost of inventory",
    icon: Package,
    trend: "up" as const,
    delta: "+4.2%",
  },
  {
    label: "Total Investment Till Date",
    value: "₹4,602,647.18",
    sublabel: "Total investment",
    icon: TrendingUp,
    trend: "up" as const,
    delta: "+8.1%",
  },
  {
    label: "Total Products",
    value: "120",
    sublabel: "Across 6 categories",
    icon: Package,
    trend: "up" as const,
    delta: "+3",
  },
  {
    label: "Low Stock Alerts",
    value: "68",
    sublabel: "Items need attention",
    icon: AlertTriangle,
    trend: "down" as const,
    delta: "Action needed",
  },
];

const fmt = (n: number) =>
  "₹" +
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function InventoryPage() {
  const [tab, setTab] = useState("all");
  const [view, setView] = useState<"table" | "card">("table");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStockFilters, setActiveStockFilters] = useState<Set<StockState>>(
    new Set()
  );
  const [search, setSearch] = useState("");

  const toggleStock = (id: StockState) => {
    setActiveStockFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setActiveCategory("all");
    setActiveStockFilters(new Set());
    setSearch("");
  };

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (activeStockFilters.size > 0 && !activeStockFilters.has(p.state)) {
        return false;
      }
      return true;
    });
  }, [search, activeStockFilters]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Inventory"
        description="Track and manage your stock, products and pricing."
        actions={
          <>
            <Button variant="ghost" size="md" leftIcon={<Download size={14} />}>
              Export
            </Button>
            <Button variant="primary" size="md" leftIcon={<Plus size={14} />}>
              Add Product
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} padding="md" hover>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-secondary text-xs">
                    <Icon size={14} />
                    <span className="truncate">{s.label}</span>
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight nums truncate">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-muted truncate">
                    {s.sublabel}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                      s.trend === "up" ? "text-secondary" : "text-secondary"
                    }`}
                  >
                    {s.trend === "up" ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {s.delta}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs + view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />
        <div className="inline-flex panel p-1 rounded-md self-start sm:self-auto">
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 h-7 rounded-sm text-xs font-medium transition-all ${
              view === "table"
                ? "bg-text text-bg"
                : "text-secondary hover:text-text"
            }`}
          >
            <LayoutList size={13} /> Table
          </button>
          <button
            onClick={() => setView("card")}
            className={`flex items-center gap-1.5 px-3 h-7 rounded-sm text-xs font-medium transition-all ${
              view === "card"
                ? "bg-text text-bg"
                : "text-secondary hover:text-text"
            }`}
          >
            <LayoutGrid size={13} /> Cards
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 lg:gap-5">
        {/* Sidebar filters */}
        <aside className="space-y-4">
          <div className="panel p-3">
            <div className="text-2xs uppercase tracking-wider text-muted font-medium px-1.5 mb-2">
              Categories
            </div>
            <ul className="space-y-0.5">
              {CATEGORIES.map((c) => {
                const active = activeCategory === c.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveCategory(c.id)}
                      className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors ${
                        active
                          ? "bg-surface-active text-text font-medium"
                          : "text-secondary hover:text-text hover:bg-surface-hover"
                      }`}
                    >
                      <span className="truncate">{c.label}</span>
                      <span
                        className={`text-xs ${
                          active ? "text-text" : "text-muted"
                        }`}
                      >
                        {c.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="panel p-3">
            <div className="text-2xs uppercase tracking-wider text-muted font-medium px-1.5 mb-2">
              Stock Status
            </div>
            <ul className="space-y-1">
              {STOCK_FILTERS.map((s) => {
                const active = activeStockFilters.has(s.id);
                return (
                  <li key={s.id}>
                    <label className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-hover cursor-pointer">
                      <span className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleStock(s.id)}
                          className="w-3.5 h-3.5 accent-current"
                        />
                        <span>{s.label}</span>
                      </span>
                      <span className="text-xs text-muted">{s.count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={clearFilters}
            leftIcon={<SlidersHorizontal size={13} />}
          >
            Clear Filters
          </Button>
        </aside>

        {/* Main panel */}
        <div className="panel p-3 sm:p-4 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-2.5 mb-4">
            <Input
              leftElement={<Search size={14} />}
              placeholder="Search by product name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <Select
                options={[
                  { value: "all", label: "All Categories" },
                  { value: "office", label: "Office & Stationery" },
                  { value: "home", label: "Home & Kitchen" },
                ]}
                defaultValue="all"
                className="w-40"
              />
              <Select
                options={[
                  { value: "all", label: "Stock Status" },
                  { value: "in_stock", label: "In Stock" },
                  { value: "low_stock", label: "Low Stock" },
                  { value: "out_of_stock", label: "Out of Stock" },
                ]}
                defaultValue="all"
                className="w-40"
              />
              <Button variant="secondary" size="md" leftIcon={<SlidersHorizontal size={13} />}>
                More
              </Button>
            </div>
          </div>

          {/* Table view */}
          {view === "table" ? (
            <Table
              data={filtered}
              rowKey={(r) => r.id}
              columns={[
                {
                  key: "product",
                  header: "Product",
                  sortable: true,
                  render: (p) => (
                    <div className="flex items-center gap-3 min-w-[260px]">
                      <div className="w-9 h-9 rounded-md bg-surface-active grid place-items-center shrink-0 text-faint">
                        <Package size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted">{p.sku}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "category",
                  header: "Category",
                  sortable: true,
                  render: (p) => <Badge tone="subtle">{p.category}</Badge>,
                },
                {
                  key: "sku",
                  header: "SKU",
                  render: (p) => <span className="text-secondary nums">{p.sku}</span>,
                },
                {
                  key: "stock",
                  header: "Stock",
                  align: "right",
                  sortable: true,
                  render: (p) => (
                    <div className="text-right nums">
                      <div className="font-semibold">{p.stock}</div>
                      <div
                        className={`text-2xs ${
                          p.state === "out_of_stock"
                            ? "text-[var(--negative)]"
                            : p.state === "low_stock"
                            ? "text-secondary"
                            : "text-muted"
                        }`}
                      >
                        {p.state === "in_stock"
                          ? "In Stock"
                          : p.state === "low_stock"
                          ? "Low Stock"
                          : "Out of Stock"}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "cost",
                  header: "Cost",
                  align: "right",
                  sortable: true,
                  render: (p) => <span className="nums">{fmt(p.cost)}</span>,
                },
                {
                  key: "price",
                  header: "Price",
                  align: "right",
                  sortable: true,
                  render: (p) => <span className="nums">{fmt(p.price)}</span>,
                },
                {
                  key: "value",
                  header: "Value (Cost)",
                  align: "right",
                  sortable: true,
                  render: (p) => (
                    <span className="nums font-medium">{fmt(p.cost * p.stock)}</span>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: () => (
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover">
                        <Pencil size={14} />
                      </button>
                      <button className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((p) => (
                <Card key={p.id} padding="md" hover>
                  <div className="flex items-start gap-3">
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
                    <Stat label="Stock" value={String(p.stock)} />
                    <Stat label="Cost" value={fmt(p.cost)} />
                    <Stat label="Price" value={fmt(p.price)} />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-subtle">
            <div className="text-xs text-muted">
              Showing 1 to {filtered.length} of 120 products
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover">
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`min-w-[28px] h-7 px-2 rounded-sm text-xs font-medium transition-colors ${
                    n === 1
                      ? "bg-text text-bg"
                      : "text-secondary hover:text-text hover:bg-surface-hover"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-muted text-xs px-1">…</span>
              <button className="min-w-[28px] h-7 px-2 rounded-sm text-xs font-medium text-secondary hover:text-text hover:bg-surface-hover">
                12
              </button>
              <button className="p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover">
                <ChevronRight size={14} />
              </button>
              <Select
                options={[
                  { value: "10", label: "10 / page" },
                  { value: "25", label: "25 / page" },
                  { value: "50", label: "50 / page" },
                ]}
                defaultValue="10"
                className="w-28 ml-2"
                inputSize="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xs uppercase tracking-wider text-muted">{label}</div>
      <div className="text-sm font-medium nums mt-0.5">{value}</div>
    </div>
  );
}
