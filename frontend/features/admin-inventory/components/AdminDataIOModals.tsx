"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, FileText, Download } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Button } from "../../../shared/components/ui/Button";
import type { Product } from "../types";
import { stockStateFor } from "../types";

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
  const [format, setFormat] = useState<"csv" | "pdf">("csv");

  const exportCsv = () => {
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
  };

  /**
   * "PDF" via a print-preview window. Opens a new tab with the inventory
   * formatted as a printable table, triggers print, and the user picks
   * "Save as PDF" from the system print dialog. Avoids bundling a heavy
   * pdf-generation library — and the result is real, copy-pasteable
   * vector text rather than a rasterised image.
   */
  const exportPdf = () => {
    const w = window.open("", "_blank", "width=960,height=720");
    if (!w) {
      alert(
        "Pop-up blocked. Please allow pop-ups for this site to export PDF."
      );
      return;
    }
    const totalValue = products.reduce(
      (s, p) => s + p.buyPrice * p.stock,
      0
    );
    const today = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const escape = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    const rupee = (n: number) =>
      "₹" +
      n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    const stateLabel = (p: Product) => {
      const s = stockStateFor(p);
      return s === "in_stock"
        ? "In Stock"
        : s === "low_stock"
        ? "Low"
        : "Out";
    };

    const rows = products
      .map(
        (p) => `
        <tr>
          <td class="mono">${escape(p.sku)}</td>
          <td>${escape(p.name)}</td>
          <td>${escape(p.category)}</td>
          <td class="right mono">${p.stock}</td>
          <td class="right mono">${rupee(p.buyPrice)}</td>
          <td class="right mono">${rupee(p.sellPrice)}</td>
          <td class="right mono">${rupee(p.buyPrice * p.stock)}</td>
          <td>${stateLabel(p)}</td>
        </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Inventory Export — ${today}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
    color: #111;
    margin: 0;
    padding: 32px 28px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 2px solid #111; }
  h1 { font-size: 18px; margin: 0; letter-spacing: -0.01em; }
  .meta { font-size: 11px; color: #555; text-align: right; line-height: 1.5; }
  .summary { display: flex; gap: 24px; margin: 16px 0 18px; font-size: 12px; }
  .summary span { color: #555; }
  .summary strong { color: #111; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead { background: #f4f4f5; }
  th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e4e4e7; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #444; font-weight: 600; }
  td.right, th.right { text-align: right; }
  .mono { font-variant-numeric: tabular-nums; }
  tr:nth-child(even) td { background: #fafafa; }
  footer { margin-top: 18px; font-size: 10px; color: #888; text-align: right; }
  @media print {
    @page { margin: 16mm 14mm; }
    body { padding: 0; }
    thead { display: table-header-group; }
  }
</style>
</head>
<body>
  <header>
    <div>
      <h1>Inventory Report</h1>
      <div style="font-size:11px;color:#555;margin-top:2px;">Stockflow Store</div>
    </div>
    <div class="meta">
      Generated ${today}<br/>
      ${products.length} products
    </div>
  </header>
  <div class="summary">
    <div><span>Products: </span><strong>${products.length}</strong></div>
    <div><span>Total Stock Value (cost): </span><strong>${rupee(totalValue)}</strong></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Product</th>
        <th>Category</th>
        <th class="right">Stock</th>
        <th class="right">Buy</th>
        <th class="right">Sell</th>
        <th class="right">Stock Value</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <footer>Generated by Stockflow on ${today}</footer>
</body>
</html>`;

    w.document.open();
    w.document.write(html);
    w.document.close();
    // Give the browser a tick to lay out before invoking print.
    w.addEventListener("load", () => {
      setTimeout(() => {
        w.focus();
        w.print();
      }, 150);
    });
  };

  const doExport = () => {
    if (format === "csv") exportCsv();
    else exportPdf();
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
            {format === "pdf" ? "Open Print / Save as PDF" : "Download"}
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
          label="PDF"
          desc="Print-ready report"
          active={format === "pdf"}
          onClick={() => setFormat("pdf")}
        />
      </div>
      {format === "pdf" && (
        <p className="mt-3 text-xs text-muted">
          Opens a print preview in a new tab — choose <em>Save as PDF</em>{" "}
          from your browser&apos;s print dialog.
        </p>
      )}
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
