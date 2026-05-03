"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, FileText, Download } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Button } from "../../../shared/components/ui/Button";
import type { Product } from "../types";

export function AdminImportModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import Inventory"
      subtitle="Upload a CSV or XLSX file with product rows."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!file}
            onClick={() => {
              if (file) {
                onImport(file);
                setFile(null);
                onClose();
              }
            }}
          >
            Import
          </Button>
        </div>
      }
    >
      <div
        onClick={() => inputRef.current?.click()}
        className="panel p-8 text-center cursor-pointer hover:bg-surface-hover"
      >
        <Upload size={24} className="mx-auto text-muted mb-2" />
        <div className="text-sm font-medium">
          {file ? file.name : "Click to choose file"}
        </div>
        <div className="text-xs text-muted mt-1">CSV or XLSX • up to 10 MB</div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </Modal>
  );
}

export function AdminExportModal({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
}) {
  const [format, setFormat] = useState<"csv" | "json">("csv");

  const doExport = () => {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(products, null, 2)], {
        type: "application/json",
      });
      triggerDownload(blob, "inventory.json");
    } else {
      const headers = [
        "id",
        "name",
        "sku",
        "category",
        "buyPrice",
        "sellPrice",
        "stock",
      ];
      const lines = [
        headers.join(","),
        ...products.map((p) =>
          headers
            .map((h) => {
              const v = (p as unknown as Record<string, unknown>)[h] ?? "";
              const s = String(v).replace(/"/g, '""');
              return /[",\n]/.test(s) ? `"${s}"` : s;
            })
            .join(",")
        ),
      ].join("\n");
      const blob = new Blob([lines], { type: "text/csv" });
      triggerDownload(blob, "inventory.csv");
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Inventory"
      subtitle={`${products.length} products will be included`}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button leftIcon={<Download size={13} />} onClick={doExport}>
            Download
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <FormatTile
          icon={<FileSpreadsheet size={18} />}
          label="CSV"
          desc="Excel / Google Sheets"
          active={format === "csv"}
          onClick={() => setFormat("csv")}
        />
        <FormatTile
          icon={<FileText size={18} />}
          label="JSON"
          desc="Raw structured data"
          active={format === "json"}
          onClick={() => setFormat("json")}
        />
      </div>
    </Modal>
  );
}

function FormatTile({
  icon,
  label,
  desc,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`panel p-4 text-left transition-all ${
        active
          ? "ring-1 ring-[var(--positive-border)] bg-[var(--positive-bg)]"
          : "hover:bg-surface-hover"
      }`}
    >
      <div className={active ? "text-[var(--positive)]" : "text-secondary"}>
        {icon}
      </div>
      <div className="mt-2 font-medium text-sm">{label}</div>
      <div className="text-xs text-muted">{desc}</div>
    </button>
  );
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
