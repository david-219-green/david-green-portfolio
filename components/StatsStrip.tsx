"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Shown until the live count loads — and always outside production.
const FALLBACK_VISITORS = 106;
const VISITORS_IDX = 4;

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
  { end: FALLBACK_VISITORS, decimals: 0, label: "visitors before you" },
];

/**
 * Counters play from the strip's FIRST visible pixel and reset only once it
 * is fully off-screen — zeros are never visible while the strip is in view.
 * Replays on every pass in either direction. `lite` is in the effect deps so
 * the trigger re-measures when the layout mode flips.
 */
export default function StatsStrip({ lite }: { lite: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visitors, setVisitors] = useState(FALLBACK_VISITORS);

  // Live visitor count — production domain only (localhost and preview
  // deploys never count). One increment per browser per calendar day;
  // otherwise read-only. Silently keeps the fallback if storage is absent.
  useEffect(() => {
    if (!/(^|\.)davidmichaelgreen\.com$/.test(window.location.hostname)) return;
    const KEY = "dg-visit-day";
    const today = new Date().toISOString().slice(0, 10);
    const increment = localStorage.getItem(KEY) !== today;
    fetch("/api/visits", { method: increment ? "POST" : "GET" })
      .then((r) => r.json())
      .then((d: { count: number | null }) => {
        if (typeof d.count === "number") {
          setVisitors(d.count);
          if (increment) localStorage.setItem(KEY, today);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const nums = ref.current.querySelectorAll<HTMLElement>("[data-num]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ends = STATS.map((s, i) => (i === VISITORS_IDX ? visitors : s.end));

    const format = (i: number, v: number) => {
      const s = STATS[i];
      return `${s.prefix ?? ""}${v.toFixed(s.decimals)}${s.suffix ?? ""}`;
    };

    if (reduced) {
      nums.forEach((el, i) => (el.textContent = format(i, ends[i])));
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
              v: ends[i],
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
        // First visible pixel → play; fully off-screen → reset. The strip is
        // never on screen showing static zeros.
        start: "top bottom",
        end: "bottom top",
        onEnter: play,
        onEnterBack: play,
        onLeave: reset,
        onLeaveBack: reset,
      });
    }, ref);
    return () => ctx.revert();
  }, [lite, visitors]);

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
