"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { FrameSequence, posterPath } from "@/lib/frames";
import { getLite } from "@/lib/lite";
import ScrubCanvas from "@/components/ScrubCanvas";

const NAME = "DAVID GREEN";
const TAGLINE = "I hate busywork. I build and use tools to make life easier.";

/**
 * Pin 300vh. Clip 1's 360° orbit maps linearly to pin progress;
 * DAVID GREEN tracks in letter-by-letter over progress 0.05→0.60
 * so the name completes just past half-orbit (docs/MOTION.md).
 */
export default function Hero({
  seq,
  ready,
  lite,
}: {
  seq: FrameSequence;
  ready: boolean;
  lite: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  // Reveal tagline + scroll cue as the preloader wipe finishes.
  useEffect(() => {
    if (!ready) return;
    gsap.fromTo(
      [taglineRef.current, cueRef.current],
      { y: 16, autoAlpha: 0 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 },
    );
  }, [ready]);

  useEffect(() => {
    // The `lite` prop is the server snapshot (false) for the first commit;
    // re-check the live media state so mobile never fetches the sequence.
    if (lite || getLite() || !outerRef.current) return;
    // Belt & braces: if the site hydrated in lite mode (small window) and
    // later flipped to full, the preloader only fetched posters — ensure the
    // orbit frames load anyway (idempotent).
    void seq.load();
    const letters = titleRef.current?.querySelectorAll<HTMLElement>("[data-letter]");
    if (!letters?.length) return;

    const ctx = gsap.context(() => {
      gsap.set(letters, { yPercent: 40 });
      // Normalized 1-unit timeline scrubbed by pin progress — ease none inside.
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      tl.to(cueRef.current, { autoAlpha: 0, duration: 0.08 }, 0)
        .to(
          letters,
          { autoAlpha: 1, yPercent: 0, duration: 0.12, stagger: 0.04 },
          0.05,
        )
        .to(titleRef.current, { yPercent: -12, autoAlpha: 0.9, duration: 0.1 }, 0.9);

      ScrollTrigger.create({
        trigger: outerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          tl.progress(self.progress);
        },
      });
    }, outerRef);
    return () => ctx.revert();
  }, [lite, seq]);

  return (
    <section ref={outerRef} className={lite ? "relative" : "relative h-[300vh]"}>
      <div
        className={
        lite
            ? "relative flex h-svh flex-col justify-between overflow-hidden"
            : "sticky top-0 flex h-screen flex-col justify-between overflow-hidden"
        }
      >
        {/* Poster paints first (LCP); canvas draws over it in full mode. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterPath(1)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        {!lite && (
          <ScrubCanvas
            seq={seq}
            progressRef={progressRef}
            className="absolute inset-0 h-full w-full"
          />
        )}
        {/* Readability scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

        <div className="relative z-10 flex items-start justify-between p-6 md:p-10">
          <span className="type-eyebrow">Portfolio — 2026</span>
          <span className="type-eyebrow">NYC</span>
        </div>

        <div className="relative z-10 p-6 pb-10 md:p-10 md:pb-14">
          <h1 ref={titleRef} className="type-hero" aria-label={NAME}>
            {NAME.split("").map((ch, i) =>
              ch === " " ? (
                <span key={i} className="inline-block w-[0.35em]" />
              ) : (
                <span
                  key={i}
                  data-letter
                  aria-hidden
                  className={lite ? "inline-block" : "inline-block opacity-0"}
                >
                  {ch}
                </span>
              ),
            )}
          </h1>
          <p
            ref={taglineRef}
            className="mt-6 max-w-md text-paper-dim opacity-0"
          >
            {TAGLINE}
          </p>
        </div>

        <div
          ref={cueRef}
          className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 opacity-0 md:block"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="type-eyebrow text-paper-dim">Scroll</span>
            <span className="h-10 w-px animate-pulse bg-emerald" />
          </div>
        </div>
      </div>
    </section>
  );
}
