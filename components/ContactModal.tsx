"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // clipboard unavailable — leave the button as-is
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-paper/10 py-5 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="type-eyebrow text-paper-dim">{label}</span>
        <span className="truncate font-mono text-base text-paper md:text-lg">
          {value}
        </span>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-paper/20 px-4 font-mono text-xs tracking-[0.1em] text-paper-dim uppercase transition-colors hover:border-flare/60 hover:text-flare"
      >
        {copied ? (
          <span className="flex items-center gap-1.5 text-flare">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Copied!
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} label="Contact David Green">
      <span className="type-eyebrow">Get in touch</span>
      <h3 className="font-display mt-2 mb-6 text-4xl tracking-wide uppercase">
        Let&apos;s talk.
      </h3>
      <CopyRow label="Phone" value="+1 (305) 815-5031" />
      <CopyRow label="Email" value="david219green@gmail.com" />
    </Modal>
  );
}
