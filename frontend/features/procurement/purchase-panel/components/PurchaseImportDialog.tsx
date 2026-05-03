"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { clsx } from "clsx";
import { Modal } from "../../../../shared/components/ui/Modal";
import { Button } from "../../../../shared/components/ui/Button";

interface PurchaseImportDialogProps {
  open: boolean;
  onClose: () => void;
}

type ImportState = "idle" | "drag" | "validating" | "preview" | "importing" | "done" | "error";

const MOCK_PREVIEW_ROWS = [
  { party: "Alpha Textiles", sku: "TS-M-BLK", qty: 50, cost: 175, gst: 5 },
  { party: "Alpha Textiles", sku: "TS-L-BLK", qty: 30, cost: 178, gst: 5 },
  { party: "Sunrise Garments", sku: "CH-32-NVY", qty: 40, cost: 400, gst: 12 },
];

export function PurchaseImportDialog({ open, onClose }: PurchaseImportDialogProps) {
  const [state, setState] = useState<ImportState>("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setState("validating");
    // Simulate validation
    setTimeout(() => setState("preview"), 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    setState("importing");
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setState("done");
      }
    }, 300);
  };

  const handleClose = () => {
    setState("idle");
    setFileName("");
    setProgress(0);
    onClose();
  };

  const downloadTemplate = () => {
    // Mock template download
    const csv =
      "party_name,sku,quantity,unit_cost,gst_percent\nAlpha Textiles,TS-M-BLK,50,175,5\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase_import_template.csv";
    a.click();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Purchase Orders"
      subtitle="Upload a CSV or Excel file with order data"
      size="lg"
      footer={
        state === "preview" ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-muted">
              {MOCK_PREVIEW_ROWS.length} rows ready to import
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleImport}>
                Import {MOCK_PREVIEW_ROWS.length} Rows
              </Button>
            </div>
          </div>
        ) : state === "done" ? (
          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {state === "idle" || state === "drag" ? (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setState("drag"); }}
              onDragLeave={() => setState("idle")}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                state === "drag"
                  ? "border-accent bg-accent-light"
                  : "border-border-default hover:border-accent hover:bg-accent-light/50"
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    state === "drag" ? "bg-accent text-white" : "bg-bg-primary text-text-muted"
                  )}
                >
                  <Upload size={22} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {state === "drag" ? "Drop file here" : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Supports .csv, .xlsx files
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>

            {/* Template download */}
            <div className="flex items-center justify-between p-3 bg-bg-primary rounded-lg border border-border-subtle">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-text-muted" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Import Template
                  </p>
                  <p className="text-xs text-text-muted">
                    Required columns: party, SKU, qty, cost, GST
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                Download
              </Button>
            </div>
          </>
        ) : state === "validating" ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">Validating file…</p>
              <p className="text-xs text-text-muted mt-1">{fileName}</p>
            </div>
          </div>
        ) : state === "preview" ? (
          <>
            <div className="flex items-center gap-2 p-3 bg-success-bg border border-[var(--success)] rounded-lg">
              <CheckCircle2 size={15} className="text-success shrink-0" />
              <p className="text-sm text-[var(--success-text)]">
                File validated: <strong>{fileName}</strong> — {MOCK_PREVIEW_ROWS.length} rows found
              </p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-bg-primary">
                  <tr>
                    {["Party", "SKU", "Qty", "Unit Cost", "GST %"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-text-muted border-b border-border-subtle">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PREVIEW_ROWS.map((row, i) => (
                    <tr key={i} className="border-b border-border-subtle last:border-0">
                      <td className="px-3 py-2 text-text-primary">{row.party}</td>
                      <td className="px-3 py-2 font-mono text-xs text-text-secondary">{row.sku}</td>
                      <td className="px-3 py-2 text-text-primary">{row.qty}</td>
                      <td className="px-3 py-2 text-text-primary">₹{row.cost}</td>
                      <td className="px-3 py-2 text-text-primary">{row.gst}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : state === "importing" ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-text-muted mb-2">
                <span>Importing…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-text-muted">Processing {MOCK_PREVIEW_ROWS.length} rows…</p>
          </div>
        ) : state === "done" ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center">
              <CheckCircle2 size={24} className="text-success" />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">
                Import Complete
              </p>
              <p className="text-sm text-text-muted mt-1">
                {MOCK_PREVIEW_ROWS.length} purchase order rows imported successfully.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle size={32} className="text-danger" />
            <p className="text-sm text-text-primary">
              Import failed. Please check your file and try again.
            </p>
            <Button variant="secondary" size="md" onClick={() => setState("idle")}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
