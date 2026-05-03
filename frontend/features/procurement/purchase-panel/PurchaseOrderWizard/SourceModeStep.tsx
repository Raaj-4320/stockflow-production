"use client";

import { Package, Sparkles, Check } from "lucide-react";
import { clsx } from "clsx";
import type { SourceMode } from "../types";

interface SourceModeStepProps {
  selected: SourceMode | null;
  onChange: (mode: SourceMode) => void;
}

const OPTIONS: {
  id: SourceMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  badges: string[];
}[] = [
  {
    id: "inventory",
    title: "From Inventory",
    description:
      "Reorder existing products already in your catalog. Pick variants and set quantities.",
    icon: <Package size={22} />,
    badges: ["Existing SKUs", "Stock tracked", "Quick select"],
  },
  {
    id: "new_product",
    title: "New Product",
    description:
      "Introduce a brand-new product with its own SKUs, colors, and sizes.",
    icon: <Sparkles size={22} />,
    badges: ["New SKU", "Custom variants", "Flexible"],
  },
];

export function SourceModeStep({ selected, onChange }: SourceModeStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          What are you ordering?
        </h3>
        <p className="text-sm text-text-muted mt-1">
          Choose whether this order is for existing inventory or a new product.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={clsx(
                "relative flex flex-col gap-3 p-5 rounded-xl border-2 text-left transition-all duration-[var(--transition)]",
                "hover:shadow-md active:scale-[0.99]",
                isSelected
                  ? "border-accent bg-accent-light shadow-sm"
                  : "border-border-default bg-bg-surface hover:border-accent/50"
              )}
            >
              {/* Check indicator */}
              <div
                className={clsx(
                  "absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "border-accent bg-accent"
                    : "border-border-default bg-bg-surface"
                )}
              >
                {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
              </div>

              {/* Icon */}
              <div
                className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-accent text-white"
                    : "bg-bg-primary text-text-secondary"
                )}
              >
                {opt.icon}
              </div>

              {/* Content */}
              <div>
                <p
                  className={clsx(
                    "text-sm font-semibold",
                    isSelected ? "text-accent" : "text-text-primary"
                  )}
                >
                  {opt.title}
                </p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {opt.badges.map((badge) => (
                  <span
                    key={badge}
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      isSelected
                        ? "bg-accent/10 text-accent"
                        : "bg-bg-primary text-text-muted"
                    )}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {!selected && (
        <p className="text-xs text-text-muted text-center pt-2">
          Select an option to continue
        </p>
      )}
    </div>
  );
}
