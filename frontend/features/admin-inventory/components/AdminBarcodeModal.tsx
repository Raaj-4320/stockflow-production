"use client";

import { useEffect, useRef } from "react";
import { Download, Share2, Printer } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Button } from "../../../shared/components/ui/Button";
import type { Product } from "../types";

interface Props {
  open: boolean;
  product: Product | null;
  storeName?: string;
  onClose: () => void;
}

/**
 * Lightweight Code-128-style stripe renderer (visual only — for real EAN/Code128
 * barcodes, swap in JsBarcode at the call site).
 */
function drawBarcodeStripes(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#000000";

  const pad = 16;
  const usable = w - pad * 2;
  const total = code.length || 12;
  const unit = usable / (total * 7);
  let x = pad;
  for (let i = 0; i < total; i++) {
    const ch = code.charCodeAt(i % code.length);
    for (let b = 0; b < 7; b++) {
      const on = (ch >> b) & 1;
      if (on) ctx.fillRect(x, 8, unit * 1.2, h - 28);
      x += unit;
    }
  }
  ctx.fillStyle = "#000000";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(code, w / 2, h - 6);
}

export function AdminBarcodeModal({ open, product, storeName, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !product || !canvasRef.current) return;
    drawBarcodeStripes(canvasRef.current, product.barcode || product.sku);
  }, [open, product]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !product) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product.sku}-barcode.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const shareTag = async () => {
    if (!product) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.sku} • ${product.barcode ?? ""}`,
        });
      } catch {
        /* cancelled */
      }
    }
  };

  const printTag = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    const w = window.open("", "_blank", "width=400,height=300");
    if (!w) return;
    w.document.write(
      `<img src="${dataUrl}" style="display:block;margin:24px auto;" />`
    );
    w.document.close();
    w.print();
  };

  if (!product) return null;

  return (
    <Modal open={open} onClose={onClose} title="Barcode Tag" size="md">
      <div className="panel p-4 bg-white text-black mx-auto max-w-sm rounded-lg">
        {storeName && (
          <div className="text-center text-xs font-semibold mb-1">
            {storeName}
          </div>
        )}
        <div className="text-center text-sm font-medium truncate">
          {product.name}
        </div>
        <canvas
          ref={canvasRef}
          width={320}
          height={120}
          className="block mx-auto mt-2"
        />
        <div className="text-center text-xs mt-1">
          ₹{product.sellPrice.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="secondary" leftIcon={<Printer size={13} />} onClick={printTag}>
          Print
        </Button>
        <Button variant="secondary" leftIcon={<Share2 size={13} />} onClick={shareTag}>
          Share
        </Button>
        <Button leftIcon={<Download size={13} />} onClick={downloadPng}>
          Download PNG
        </Button>
      </div>
    </Modal>
  );
}
