"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Manually edited by David — bump whenever.
const VISITORS = 106;

const STATS: {
  end: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  label: string;
}[] = [
  { end: 2.3, decimals: 1, prefix: "$", suffix: "M", label: "ARR managed" },
  { end: 174, decimals: 0, label: "Frequency users\nin 25 days" },
  { end: 3.9, decimals: 1, label: "GPA" },
  { end: 7, decimals: 0, label: "platforms shipped" },
  { end: VISITORS, decimals: 0, label: "visitors before you" },
];

/**
 * Counters re-run on EVERY viewport entry (down or up) and reset once the
 * strip fully leaves, so scrolling back always replays the count-up.
 */
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
      const tweens: gsap.core.Tween[] = [];
      const reset = () => {
        tweens.forEach((t) => t.kill());
        tweens.length = 0;
        nums.forEach((el, i) => (el.textContent = format(i, 0)));
      };
      const play = () => {
        reset();
        nums.forEach((el, i) => {
          const counter = { v: 0 };
          tweens.push(
            gsap.to(counter, {
              v: STATS[i].end,
              duration: 1.2,
              ease: "power1.out",
              delay: i * 0.08,
              onUpdate: () => {
                el.textContent = format(i, counter.v);
              },
            }),
          );
        });
      };
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 65%",
        end: "bottom top",
        onEnter: play,
        onEnterBack: play,
        onLeave: reset,
        onLeaveBack: reset,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="border-y border-paper/10 bg-ink-soft">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-10 px-6 py-16 md:grid-cols-5 md:gap-x-12 md:py-20">
        {STATS.map((s, i) => (
          <div key={s.label} className="flex flex-col items-start gap-2">
            <span
              data-num
              className="font-mono text-4xl text-flare tabular-nums md:text-5xl"
            >
              {`${s.prefix ?? ""}${(0).toFixed(s.decimals)}${s.suffix ?? ""}`}
            </span>
            <span className="type-eyebrow whitespace-pre-line text-paper-dim">
              {STATS[i].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
