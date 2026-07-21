"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Shared modal shell: blurred ink overlay, animated panel, body scroll lock.
 * Fires "modal-toggle" so Site can pause/resume Lenis while a modal is open.
 * dismissible=false makes it a hard gate: no X, no outside click, no Esc.
 */
export default function Modal({
  open,
  onClose,
  dismissible = true,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  dismissible?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new CustomEvent("modal-toggle", { detail: { open: true } }));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.dispatchEvent(
        new CustomEvent("modal-toggle", { detail: { open: false } }),
      );
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-overlay backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={dismissible ? onClose : undefined}
    >
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {dismissible && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-paper/15 font-mono text-lg text-paper-dim transition-colors hover:border-paper/40 hover:text-paper"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
