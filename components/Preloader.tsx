"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Ink-black loading screen with a mono counter tied to ACTUAL hero-frame
 * preloading. `progress` is loaded/total (0..1) reported by the hero
 * sequence loader; `done` flips when every frame settled AND fonts are ready.
 * Minimum 1.8s on screen so fast loads still land the beat.
 */
export default function Preloader({
  progress,
  done,
  onRevealed,
}: {
  progress: number;
  done: boolean;
  onRevealed: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const shown = useRef<number>(0);
  const displayed = useRef({ value: 0 });
  const revealed = useRef(false);

  useEffect(() => {
    shown.current = performance.now();
  }, []);

  // Counter never runs backward: tween toward real progress with snap.
  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    gsap.to(displayed.current, {
      value: Math.round(progress * 100),
      duration: 0.4,
      ease: "power1.out",
      snap: { value: 1 },
      overwrite: true,
      onUpdate: () => {
        el.textContent = String(Math.round(displayed.current.value)).padStart(3, "0");
      },
    });
  }, [progress]);

  useEffect(() => {
    if (!done || revealed.current) return;
    revealed.current = true;
    const wait = Math.max(0, 1800 - (performance.now() - shown.current));
    const tl = gsap.timeline({ delay: wait / 1000 });
    tl.to(displayed.current, {
      value: 100,
      duration: 0.3,
      snap: { value: 1 },
      onUpdate: () => {
        if (counterRef.current)
          counterRef.current.textContent = String(
            Math.round(displayed.current.value),
          ).padStart(3, "0");
      },
    })
      .to(counterRef.current, {
        yPercent: -110,
        duration: 0.45,
        ease: "power2.in",
      })
      .to(overlayRef.current, {
        clipPath: "inset(0 0 100% 0)",
        duration: 1.1,
        ease: "expo.inOut",
        onComplete: () => {
          overlayRef.current?.style.setProperty("display", "none");
          onRevealed();
        },
      });
    return () => {
      tl.kill();
    };
  }, [done, onRevealed]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-between bg-ink p-8 md:p-12"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      <span className="type-eyebrow">David Green — portfolio</span>
      <div className="overflow-hidden">
        <div
          ref={counterRef}
          className="font-mono text-6xl text-paper tabular-nums md:text-8xl"
        >
          000
        </div>
      </div>
    </div>
  );
}
