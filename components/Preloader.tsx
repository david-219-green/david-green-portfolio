"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Centered DG monogram preloader. The mark draws itself as an emerald stroke
 * mapped to REAL hero-frame load progress (`progress` = loaded/total). When
 * `done` flips: stroke snaps complete, a checkmark draws over it with a green
 * flare, and the overlay wipes straight into the hero. 0.8s anti-flash
 * minimum on screen, nothing else holds the reveal.
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
  const glowRef = useRef<HTMLDivElement>(null);
  const dgRef = useRef<SVGGElement>(null);
  const dPath = useRef<SVGPathElement>(null);
  const gPath = useRef<SVGPathElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const shown = useRef(0);
  const displayed = useRef({ v: 0 });
  const revealed = useRef(false);

  useEffect(() => {
    shown.current = performance.now();
  }, []);

  // Stroke never runs backward: tween the drawn fraction toward real progress.
  useEffect(() => {
    gsap.to(displayed.current, {
      v: progress,
      duration: 0.35,
      ease: "power1.out",
      overwrite: true,
      onUpdate: () => {
        const off = 100 * (1 - displayed.current.v);
        dPath.current?.setAttribute("stroke-dashoffset", String(off));
        gPath.current?.setAttribute("stroke-dashoffset", String(off));
      },
    });
  }, [progress]);

  useEffect(() => {
    if (!done || revealed.current) return;
    revealed.current = true;
    const wait = Math.max(0, 800 - (performance.now() - shown.current));
    const tl = gsap.timeline({ delay: wait / 1000 });
    tl.to(displayed.current, {
      // Snap the monogram fully drawn.
      v: 1,
      duration: 0.2,
      ease: "power2.out",
      onUpdate: () => {
        const off = 100 * (1 - displayed.current.v);
        dPath.current?.setAttribute("stroke-dashoffset", String(off));
        gPath.current?.setAttribute("stroke-dashoffset", String(off));
      },
    })
      .to(glowRef.current, { autoAlpha: 0.3, duration: 0.25 }, "<")
      // Darken the monogram FIRST, then the check draws as the sole bright element.
      .to(dgRef.current, { autoAlpha: 0.07, duration: 0.25 }, "+=0.05")
      .to(
        checkRef.current,
        { attr: { "stroke-dashoffset": 0 }, duration: 0.35, ease: "power2.out" },
        "-=0.06",
      )
      .to(
        overlayRef.current,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.7,
          ease: "expo.inOut",
          onComplete: () => {
            overlayRef.current?.style.setProperty("display", "none");
            onRevealed();
          },
        },
        "+=0.15",
      );
    return () => {
      tl.kill();
    };
  }, [done, onRevealed]);

  return (
    <div
      ref={overlayRef}
      data-preloader
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      <div
        ref={glowRef}
        aria-hidden
        className="absolute h-80 w-80 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--emerald-flare) 28%, transparent), transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 200 120"
        className="relative w-44 md:w-60"
        fill="none"
        aria-label="Loading"
        role="img"
      >
        {/* Monogram draws at full brightness, then dims right before the check. */}
        <g
          ref={dgRef}
          stroke="var(--emerald-flare)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            ref={dPath}
            d="M32 100 V20 C80 20 94 38 94 60 C94 82 80 100 32 100 Z"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100}
          />
          <path
            ref={gPath}
            d="M170 36 C162 25 150 20 138 20 C114 20 98 38 98 60 C98 82 114 100 138 100 C157 100 168 90 170 72 H144"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100}
          />
        </g>
        <path
          ref={checkRef}
          d="M66 64 L92 90 L138 38"
          stroke="var(--emerald-flare)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100}
        />
      </svg>
    </div>
  );
}
