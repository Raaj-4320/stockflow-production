"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { VariantCell } from "../types";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";

interface MatrixProps {
  variants: string[];
  colors: string[];
  cells: VariantCell[];
  onChange: (next: {
    variants: string[];
    colors: string[];
    cells: VariantCell[];
  }) => void;
  variantsMaster: string[];
  colorsMaster: string[];
}

const cellKey = (v: string, c: string) => `${v}__${c}`;

export function AdminVariantMatrix({
  variants,
  colors,
  cells,
  onChange,
  variantsMaster,
  colorsMaster,
}: MatrixProps) {
  const [newVariant, setNewVariant] = useState("");
  const [newColor, setNewColor] = useState("");

  const cellMap = useMemo(() => {
    const m = new Map<string, VariantCell>();
    for (const c of cells) m.set(cellKey(c.variant, c.color), c);
    return m;
  }, [cells]);

  const updateCell = (
    v: string,
    c: string,
    field: "stock" | "buyPrice" | "sellPrice",
    value: number
  ) => {
    const key = cellKey(v, c);
    const existing = cellMap.get(key) ?? {
      variant: v,
      color: c,
      stock: 0,
      buyPrice: 0,
      sellPrice: 0,
    };
    const next: VariantCell = { ...existing, [field]: value };
    const others = cells.filter((x) => cellKey(x.variant, x.color) !== key);
    onChange({ variants, colors, cells: [...others, next] });
  };

  const addVariant = (token: string) => {
    const t = token.trim();
    if (!t || variants.includes(t)) return;
    onChange({ variants: [...variants, t], colors, cells });
    setNewVariant("");
  };
  const removeVariant = (t: string) =>
    onChange({
      variants: variants.filter((v) => v !== t),
      colors,
      cells: cells.filter((c) => c.variant !== t),
    });

  const addColor = (token: string) => {
    const t = token.trim();
    if (!t || colors.includes(t)) return;
    onChange({ variants, colors: [...colors, t], cells });
    setNewColor("");
  };
  const removeColor = (t: string) =>
    onChange({
      variants,
      colors: colors.filter((c) => c !== t),
      cells: cells.filter((c) => c.color !== t),
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TokenAdder
          label="Variants (size, weight, model…)"
          tokens={variants}
          onRemove={removeVariant}
          inputValue={newVariant}
          onInputChange={setNewVariant}
          onAdd={() => addVariant(newVariant)}
          suggestions={variantsMaster.filter((v) => !variants.includes(v))}
          onPickSuggestion={addVariant}
        />
        <TokenAdder
          label="Colors"
          tokens={colors}
          onRemove={removeColor}
          inputValue={newColor}
          onInputChange={setNewColor}
          onAdd={() => addColor(newColor)}
          suggestions={colorsMaster.filter((c) => !colors.includes(c))}
          onPickSuggestion={addColor}
        />
      </div>

      {variants.length > 0 && colors.length > 0 ? (
        <div className="overflow-x-auto panel p-3">
          <table className="w-full border-collapse min-w-[480px]">
            <thead>
              <tr className="border-b border-subtle">
                <th className="text-left text-2xs font-medium text-muted uppercase tracking-wider px-2 py-2">
                  Variant / Color
                </th>
                {colors.map((c) => (
                  <th
                    key={c}
                    className="text-2xs font-medium text-muted uppercase tracking-wider px-2 py-2"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v} className="border-b border-subtle last:border-0">
                  <td className="px-2 py-2 text-sm font-medium">{v}</td>
                  {colors.map((c) => {
                    const cell = cellMap.get(cellKey(v, c));
                    return (
                      <td key={c} className="px-2 py-2 align-top">
                        <div className="space-y-1">
                          <MiniInput
                            label="Stock"
                            value={cell?.stock ?? 0}
                            onChange={(n) => updateCell(v, c, "stock", n)}
                          />
                          <MiniInput
                            label="Buy"
                            value={cell?.buyPrice ?? 0}
                            onChange={(n) => updateCell(v, c, "buyPrice", n)}
                            prefix="₹"
                          />
                          <MiniInput
                            label="Sell"
                            value={cell?.sellPrice ?? 0}
                            onChange={(n) => updateCell(v, c, "sellPrice", n)}
                            prefix="₹"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-xs text-muted px-1">
          Add at least one variant and one color to build the matrix.
        </div>
      )}
    </div>
  );
}

function TokenAdder({
  label,
  tokens,
  onRemove,
  inputValue,
  onInputChange,
  onAdd,
  suggestions,
  onPickSuggestion,
}: {
  label: string;
  tokens: string[];
  onRemove: (t: string) => void;
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  suggestions: string[];
  onPickSuggestion: (t: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-secondary mb-1.5">{label}</div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[28px]">
        {tokens.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-surface border border-subtle"
          >
            {t}
            <button
              onClick={() => onRemove(t)}
              className="text-muted hover:text-text"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        {tokens.length === 0 && (
          <span className="text-xs text-muted">No tokens yet</span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Add new…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button variant="secondary" leftIcon={<Plus size={13} />} onClick={onAdd}>
          Add
        </Button>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {suggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              onClick={() => onPickSuggestion(s)}
              className="px-2 py-0.5 rounded-full text-xs text-secondary hover:text-text border border-subtle hover:bg-surface-hover"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniInput({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-2xs text-muted block">{label}</span>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`input-base h-7 text-xs ${prefix ? "pl-5" : ""}`}
        />
      </div>
    </label>
  );
}
