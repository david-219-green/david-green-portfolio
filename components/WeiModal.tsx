"use client";

import Modal from "@/components/Modal";

const WEI_DEMO_URL = "https://wei-v1.vercel.app/";

/**
 * Hard gate before the WEI demo: not dismissible by X / outside click / Esc.
 * Explains that the production system is client-private before letting the
 * visitor through to the local demo build.
 */
export default function WeiModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} dismissible={false} label="About the WEI build">
      <span className="type-eyebrow">WEI — contracted build</span>
      <h3 className="font-display mt-2 mb-5 text-4xl tracking-wide uppercase">
        The real one is locked.
      </h3>
      <p className="text-paper/85">
        WEI runs in production for SASI on their private internal data — no
        outside access, full stop. They&apos;re using it daily, and the system
        keeps evolving for them.
      </p>
      <p className="mt-3 text-paper/85">
        What you can open here is my local demo build: the same platform,
        none of the sensitive data.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href={WEI_DEMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="inline-block cursor-pointer border border-emerald bg-emerald/10 px-6 py-3.5 font-mono text-sm tracking-[0.14em] text-flare uppercase transition-colors duration-300 hover:bg-emerald hover:text-ink"
        >
          Enter the demo →
        </a>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer px-2 py-3.5 font-mono text-xs tracking-[0.12em] text-paper-dim uppercase transition-colors hover:text-paper"
        >
          Back to portfolio
        </button>
      </div>
    </Modal>
  );
}
