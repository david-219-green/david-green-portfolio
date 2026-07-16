"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const STATS: {
  end: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  label: string;
}[] = [
  { end: 2.3, decimals: 1, prefix: "$", suffix: "M", label: "ARR managed" },
  { end: 174, decimals: 0, label: "users in 25 days" },
  { end: 3.9, decimals: 1, label: "GPA" },
  { end: 8, decimals: 0, label: "platforms shipped" },
];

/** Counters fire once at top 65% — an event, not a slider (docs/MOTION.md). */
export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const nums = ref.current.querySelectorAll<HTMLElement>("[data-num]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const format = (i: number, v: number) => {
      const s = STATS[i];
      return `${s.prefix ?? ""}${v.toFixed(s.decimals)}${s.suffix ?? ""}`;
    };

    if (reduced) {
      nums.forEach((el, i) => (el.textContent = format(i, STATS[i].end)));
      return;
    }

    const ctx = gsap.context(() => {
      nums.forEach((el, i) => {
        const counter = { v: 0 };
        gsap.to(counter, {
          v: STATS[i].end,
          duration: 1.2,
          ease: "power1.out",
          delay: i * 0.08,
          onUpdate: () => {
            el.textContent = format(i, counter.v);
          },
          scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="border-y border-paper/10 bg-ink-soft">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 py-16 md:grid-cols-4 md:py-20">
        {STATS.map((s, i) => (
          <div key={s.label} className="flex flex-col items-start gap-2">
            <span
              data-num
              className="font-mono text-4xl text-flare tabular-nums md:text-5xl"
            >
              {`${s.prefix ?? ""}${(0).toFixed(s.decimals)}${s.suffix ?? ""}`}
            </span>
            <span className="type-eyebrow text-paper-dim">{STATS[i].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
