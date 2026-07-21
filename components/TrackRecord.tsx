"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const ROLES: {
  company: string;
  role: string;
  dates: string;
  receipts: string;
}[] = [
  {
    company: "Rilla",
    role: "Consumer Product Success Manager",
    dates: "Nov 2025 → May 2026",
    receipts:
      "$2.3M book of business · $1.3M retained · $67K upsold · internal finance dashboard, built solo",
  },
  {
    company: "Lumen",
    role: "Software Developer Intern",
    dates: "Summer 2025",
    receipts:
      "Built LIA, an agentic AI assistant · 500+ test queries at 92% intent accuracy · demoed to an SVP",
  },
  {
    company: "Lead Autopilot AI",
    role: "Product Management Intern",
    dates: "Oct 2024 → Apr 2025",
    receipts:
      "7 client microsites shipped · AI conversation flows lifting lead response 8% · automated SEO content engine",
  },
  {
    company: "Investing.com",
    role: "Product Management Intern",
    dates: "Summer 2024",
    receipts:
      "Competitive teardown of the top 5 rival apps · A/B tested personalization across 7 market sections · simplified 4",
  },
];

/** Career ledger: rows masked-reveal once with an emerald tick per row. */
// `lite` in the effect deps re-measures the trigger when the layout mode flips.
export default function TrackRecord({ lite }: { lite: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
      const ticks = gsap.utils.toArray<HTMLElement>("[data-tick]");
      const reset = () => {
        gsap.killTweensOf([...rows, ...ticks]);
        gsap.set(rows, { autoAlpha: 0, y: 28 });
        gsap.set(ticks, { scaleY: 0, transformOrigin: "top" });
      };
      const play = () => {
        reset();
        gsap.to(rows, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
        });
        gsap.to(ticks, {
          scaleY: 1,
          duration: 0.6,
          stagger: 0.12,
          delay: 0.1,
          ease: "power2.out",
        });
      };
      reset();
      // Replays on every pass: reappears whenever it comes back on screen.
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 70%",
        end: "bottom top",
        onEnter: play,
        onEnterBack: play,
        onLeave: reset,
        onLeaveBack: reset,
      });
    }, ref);
    return () => ctx.revert();
  }, [lite]);

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <span className="type-eyebrow">Track record</span>
      <h2 className="font-display mt-3 mb-12 text-4xl tracking-wide uppercase md:text-6xl">
        Where I&apos;ve Operated
      </h2>
      <div>
        {ROLES.map((r) => (
          <div
            key={r.company}
            data-row
            className="relative border-b border-paper/10 py-8 pl-5 last:border-b-0"
          >
            <span
              data-tick
              aria-hidden
              className="absolute top-9 bottom-9 left-0 w-px bg-flare/70"
            />
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <h3 className="font-display text-2xl tracking-wide uppercase md:text-3xl">
                {r.company}
              </h3>
              <span className="font-mono text-xs text-paper-dim">
                {r.role} · {r.dates}
              </span>
            </div>
            <p className="mt-3 max-w-3xl font-mono text-xs leading-relaxed text-paper/75 md:text-sm">
              {r.receipts}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
