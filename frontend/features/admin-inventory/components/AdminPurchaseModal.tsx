"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Input } from "../../../shared/components/ui/Input";
import { NumberInput } from "../../../shared/components/ui/NumberInput";
import { Button } from "../../../shared/components/ui/Button";
import { Tabs } from "../../../shared/components/ui/Tabs";
import { Dropdown } from "../../../shared/components/ui/Dropdown";
import { Autocomplete } from "../../../shared/components/ui/Autocomplete";
import { useKeyboardShortcuts } from "../../../shared/hooks/useKeyboardShortcuts";
import { fmt, weightedBuyPrice } from "../utils/inventoryMetrics";
import type { Product, PurchaseParty } from "../types";

interface Props {
  open: boolean;
  product: Product | null;
  parties: PurchaseParty[];
  onClose: () => void;
  onSubmit: (payload: {
    productId: string;
    qty: number;
    unitCost: number;
    partyName: string;
    amountPaid: number;
    paymentMethod?: "cash" | "upi" | "bank" | "credit";
    note?: string;
  }) => void;
}

export function AdminPurchaseModal({
  open,
  product,
  parties,
  onClose,
  onSubmit,
}: Props) {
  const [tab, setTab] = useState("add");
  const [qty, setQty] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [partyName, setPartyName] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "upi" | "bank" | "credit"
  >("cash");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && product) {
      setQty(0);
      setUnitCost(product.buyPrice);
      setPartyName("");
      setAmountPaid(0);
      setPaymentMethod("cash");
      setNote("");
      setErrors({});
      setTab("add");
    }
  }, [open, product]);

  const totalAmount = qty * unitCost;
  const newBuy = useMemo(
    () =>
      product
        ? weightedBuyPrice(product.stock, product.buyPrice, qty || 0, unitCost || 0)
        : 0,
    [product, qty, unitCost]
  );

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (qty <= 0) e.qty = "Must be > 0";
    if (unitCost <= 0) e.unitCost = "Must be > 0";
    if (!partyName.trim()) e.partyName = "Required";
    if (amountPaid > totalAmount) e.amountPaid = "Cannot exceed total";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!product) return;
    if (!validate()) return;
    onSubmit({
      productId: product.id,
      qty,
      unitCost,
      partyName: partyName.trim(),
      amountPaid,
      paymentMethod,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const formRef = useKeyboardShortcuts<HTMLDivElement>({
    onSave: submit,
    onCancel: onClose,
    enabled: open && tab === "add",
  });

  if (!product) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Purchase — ${product.name}`}
      subtitle={`SKU ${product.sku} • Current stock ${product.stock}`}
      size="lg"
      footer={
        tab === "add" && (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted">
              Press <kbd className="px-1 rounded bg-surface border border-subtle">Enter</kbd> to save
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={submit}>Post Purchase</Button>
            </div>
          </div>
        )
      }
    >
      <Tabs
        tabs={[
          { id: "add", label: "Add Purchase" },
          {
            id: "history",
            label: "History",
            count: product.history?.length ?? 0,
          },
        ]}
        activeTab={tab}
        onChange={setTab}
        className="mb-4"
      />

      {tab === "add" ? (
        <div ref={formRef} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NumberInput
              label="Quantity"
              required
              allowDecimal={false}
              min={0}
              value={qty}
              onChange={setQty}
              error={errors.qty}
              autoFocus
            />
            <NumberInput
              label="Unit Cost"
              required
              leftElement="₹"
              min={0}
              value={unitCost}
              onChange={setUnitCost}
              error={errors.unitCost}
            />
            <div>
              <div className="text-sm font-medium text-secondary mb-1.5">
                Total Amount
              </div>
              <div className="input-base h-9 inline-flex items-center justify-end nums font-semibold">
                {fmt(totalAmount)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Autocomplete
              label="Party"
              required
              value={partyName}
              onChange={setPartyName}
              options={parties.map((p) => p.name)}
              error={errors.partyName}
              hint="Pick a saved party — or type to create a new one"
              placeholder="Search saved parties…"
            />
            <Dropdown<typeof paymentMethod>
              label="Payment Method"
              value={paymentMethod}
              onChange={(v) => setPaymentMethod(v)}
              options={[
                { value: "cash", label: "Cash" },
                { value: "upi", label: "UPI" },
                { value: "bank", label: "Bank Transfer" },
                { value: "credit", label: "Credit (Pay Later)" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumberInput
              label="Amount Paid Now"
              leftElement="₹"
              min={0}
              value={amountPaid}
              onChange={setAmountPaid}
              error={errors.amountPaid}
              hint={`Outstanding: ${fmt(Math.max(0, totalAmount - amountPaid))}`}
            />
            <Input
              label="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="rounded-md p-3 bg-surface border border-subtle">
            <div className="text-2xs uppercase tracking-wider text-muted font-medium mb-2">
              Buy-price impact
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary">Current weighted buy price</span>
              <span className="nums">{fmt(product.buyPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-secondary">After this purchase</span>
              <span className="nums font-semibold text-[var(--positive)]">
                {fmt(newBuy)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {(product.history ?? []).length === 0 ? (
            <div className="text-sm text-muted py-8 text-center">
              No purchase history yet.
            </div>
          ) : (
            product.history!.map((h) => (
              <div
                key={h.id}
                className="rounded-md p-3 bg-surface border border-subtle flex flex-wrap items-center gap-3 text-sm"
              >
                <div className="font-medium min-w-[100px]">{h.date}</div>
                <div className="text-secondary min-w-[140px]">{h.party}</div>
                <div className="nums">
                  {h.qty} × {fmt(h.unitCost)}
                </div>
                <div className="ml-auto text-secondary text-xs">
                  Buy: {fmt(h.prevBuyPrice)} →{" "}
                  <span className="text-text font-medium">
                    {fmt(h.newBuyPrice)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}
