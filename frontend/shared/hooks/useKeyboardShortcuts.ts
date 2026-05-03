"use client";

import { useEffect, useRef } from "react";

interface Options {
  onSave?: () => void;
  onCancel?: () => void;
  enabled?: boolean;
  /**
   * If true, Enter is captured anywhere inside the container.
   * If false (default), Enter only fires from input/select/textarea elements.
   */
  captureEnterAnywhere?: boolean;
}

/**
 * Form keyboard shortcuts:
 *   Enter   → save (skipped inside <textarea> and on buttons that already handle it)
 *   Tab     → native focus move (left to browser, but we ensure last-field wraps)
 *   Escape  → cancel
 *
 * Returns a ref to attach to the form/container element.
 */
export function useKeyboardShortcuts<T extends HTMLElement = HTMLDivElement>({
  onSave,
  onCancel,
  enabled = true,
  captureEnterAnywhere = false,
}: Options) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const handler = (e: KeyboardEvent) => {
      // ESC → cancel
      if (e.key === "Escape" && onCancel) {
        e.stopPropagation();
        onCancel();
        return;
      }

      if (e.key !== "Enter") return;
      if (!onSave) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't intercept inside textarea (multiline)
      if (target.tagName === "TEXTAREA") return;

      // If shift+enter, let it through
      if (e.shiftKey) return;

      // If a button/anchor is focused, let its own click handler run
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.getAttribute("role") === "button"
      ) {
        return;
      }

      const isFormField =
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (captureEnterAnywhere || isFormField) {
        e.preventDefault();
        onSave();
      }
    };

    node.addEventListener("keydown", handler);
    return () => node.removeEventListener("keydown", handler);
  }, [onSave, onCancel, enabled, captureEnterAnywhere]);

  return ref;
}
