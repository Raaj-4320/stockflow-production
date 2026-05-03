"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "./Button";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlay?: boolean;
  hideClose?: boolean;
  className?: string;
}

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]",
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  hideClose = false,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (closeOnOverlay && e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal
      aria-label={title}
    >
      <div
        className={clsx(
          "relative flex flex-col rounded-xl shadow-lg w-full animate-scale-in",
          // Solid surface — no glass — so the modal reads cleanly in both themes
          "bg-bg-elevated border border-[var(--border-strong)]",
          size === "full"
            ? "max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]"
            : "max-h-[90vh]",
          sizeMap[size],
          className
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-subtle shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-secondary mt-0.5">{subtitle}</p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-md text-muted hover:text-text hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="px-5 py-4 border-t border-subtle shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="space-y-2">
        <h2 className="text-md font-semibold">{title}</h2>
        <div className="text-sm text-secondary">{description}</div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
