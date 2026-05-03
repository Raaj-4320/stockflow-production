"use client";

import { useState } from "react";
import { Search, Check, ImageOff } from "lucide-react";
import { clsx } from "clsx";
import type { Product } from "../types";
import { Input } from "../../../../shared/components/ui/Input";

interface InventoryProductStepProps {
  products: Product[];
  selectedId: string | null;
  onSelect: (product: Product) => void;
}

export function InventoryProductStep({
  products,
  selectedId,
  onSelect,
}: InventoryProductStepProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Select a Product
        </h3>
        <p className="text-sm text-text-muted mt-1">
          Choose the product you want to reorder.
        </p>
      </div>

      <Input
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftElement={<Search size={14} />}
      />

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-text-muted">
          No products match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map((product) => {
            const isSelected = selectedId === product.id;
            return (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-[var(--transition-fast)]",
                  "hover:shadow-sm active:scale-[0.99]",
                  isSelected
                    ? "border-accent bg-accent-light"
                    : "border-border-default bg-bg-surface hover:border-accent/40"
                )}
              >
                {/* Product image */}
                <div className="w-11 h-11 rounded-lg bg-bg-primary border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageOff size={18} className="text-text-muted" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-text-muted">
                      {product.category}
                    </span>
                    <span className="text-xs text-text-muted">
                      {product.variants.length} variant
                      {product.variants.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Selected indicator */}
                <div
                  className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    isSelected
                      ? "border-accent bg-accent"
                      : "border-border-default"
                  )}
                >
                  {isSelected && (
                    <Check size={11} strokeWidth={3} className="text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
