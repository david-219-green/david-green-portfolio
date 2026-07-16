"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { FrameSequence, posterPath } from "@/lib/frames";
import { getLite } from "@/lib/lite";
import ScrubCanvas from "@/components/ScrubCanvas";

export type Accent = "build" | "operate" | "compete" | "live";

const GLYPHS = "⌁◇⟢∆⌗◈⟡∇⌬◆⟠"; // abstract drift for BUILD — never legible words

/**
 * Pinned 250vh chapter over a clip scrub. Bands per docs/MOTION.md:
 * 0.06–0.30 index+word scrub in · copy masked-reveal fired once at 0.22 ·
 * 0.80–1 title exits. One accent mechanic per chapter.
 */
export default function ChapterSection({
  seq,
  clip,
  index,
  word,
  copy,
  accent,
  lite,
}: {
  seq: FrameSequence;
  clip: number;
  index: string;
  word: string;
  copy: string[];
  accent: Accent;
  lite: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  // Lazy-load this clip's frames as the section approaches (150% margin).
  useEffect(() => {
    // `lite` is the server snapshot (false) on the first commit — re-check
    // live so mobile never fetches frame sequences.
    if (lite || getLite() || !outerRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void seq.load();
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(outerRef.current);
    return () => io.disconnect();
  }, [seq, lite]);

  useEffect(() => {
    if (!outerRef.current) return;
    const lines = copyRef.current?.querySelectorAll<HTMLElement>("[data-line]");

    if (lite) {
      // Poster + one triggered fade — no pins, no scrubs.
      const ctx = gsap.context(() => {
        gsap.from([wordRef.current, ...(lines ? Array.from(lines) : [])], {
          autoAlpha: 0,
          y: 24,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: outerRef.current, start: "top 70%", once: true },
        });
      }, outerRef);
      return () => ctx.revert();
    }

    const chars = wordRef.current?.querySelectorAll<HTMLElement>("[data-char]");
    if (!chars?.length) return;

    const ctx = gsap.context(() => {
      gsap.set(chars, { yPercent: 110 });
      if (lines?.length) gsap.set(lines, { yPercent: 110 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      tl.fromTo(
        indexRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.1 },
        0.06,
      )
        .to(chars, { yPercent: 0, duration: 0.14, stagger: 0.02 }, 0.08)
        .to(
          [wordRef.current, indexRef.current],
          { yPercent: -50, autoAlpha: 0, duration: 0.18 },
          0.82,
        );

      // Accent mechanics — same skeleton, one varying element per chapter.
      if (accent === "operate" && accentRef.current) {
        const counter = { v: 0 };
        const el = accentRef.current;
        tl.to(
          counter,
          {
            v: 2.3,
            duration: 0.45,
            onUpdate: () => {
              el.textContent = `$${counter.v.toFixed(1)}M ARR`;
            },
          },
          0.3,
        );
      }
      if (accent === "build" && accentRef.current) {
        tl.fromTo(
          accentRef.current,
          { xPercent: 12, autoAlpha: 0.25 },
          { xPercent: -12, autoAlpha: 0.6, duration: 0.9 },
          0.05,
        );
      }
      if (accent === "compete" && flashRef.current) {
        tl.fromTo(
          flashRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 0.55, duration: 0.04 },
          0.68,
        ).to(flashRef.current, { autoAlpha: 0, duration: 0.1 }, 0.72);
      }
      if (accent === "live" && accentRef.current) {
        tl.fromTo(
          accentRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 0.45, duration: 0.5 },
          0.5,
        );
      }

      let copyPlayed = false;
      const copyIn = () => {
        if (copyPlayed || !lines?.length) return;
        copyPlayed = true;
        gsap.to(lines, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.07,
          ease: "expo.out",
        });
      };

      ScrollTrigger.create({
        trigger: outerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          tl.progress(self.progress);
          if (self.progress > 0.22) copyIn();
        },
      });
    }, outerRef);
    return () => ctx.revert();
  }, [lite, accent]);

  return (
    <section ref={outerRef} className={lite ? "relative" : "relative h-[250vh]"}>
      <div
        className={
          lite
            ? "relative flex min-h-svh flex-col justify-end overflow-hidden"
            : "sticky top-0 flex h-screen flex-col justify-end overflow-hidden"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterPath(clip)}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {!lite && (
          <ScrubCanvas
            seq={seq}
            progressRef={progressRef}
            className="absolute inset-0 h-full w-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

        {/* Accent layers */}
        {accent === "build" && (
          <div
            ref={accentRef}
            aria-hidden
            className="absolute top-16 left-0 z-10 w-full overflow-hidden font-mono text-2xl tracking-[0.6em] whitespace-nowrap text-emerald/60 select-none"
          >
            {GLYPHS.repeat(8)}
          </div>
        )}
        {accent === "operate" && (
          <div
            ref={accentRef}
            className="absolute top-1/4 right-6 z-10 font-mono text-3xl text-holo tabular-nums md:right-12 md:text-5xl"
          >
            $0.0M ARR
          </div>
        )}
        {accent === "live" && (
          <div
            ref={accentRef}
            aria-hidden
            className="absolute inset-0 z-10 opacity-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 80%, color-mix(in srgb, var(--emerald-flare) 45%, transparent), transparent 65%)",
            }}
          />
        )}
        {accent === "compete" && (
          <div
            ref={flashRef}
            aria-hidden
            className="absolute inset-0 z-10 bg-flare opacity-0 mix-blend-screen"
          />
        )}

        <div className="relative z-20 p-6 pb-12 md:p-12 md:pb-16">
          <span ref={indexRef} className="type-eyebrow block">
            {index} / The Four Frequencies
          </span>
          <div className="mask-line mt-2">
            <h2 ref={wordRef} className="type-chapter" aria-label={word}>
              {word.split("").map((ch, i) => (
                <span key={i} data-char aria-hidden className="inline-block">
                  {ch}
                </span>
              ))}
            </h2>
          </div>
          <div ref={copyRef} className="mt-6 max-w-lg space-y-1">
            {copy.map((line, i) => (
              <span key={i} className="mask-line">
                <span
                  data-line
                  className={
                    (lite ? "" : "opacity-0 ") +
                    "block text-base text-paper/90 md:text-lg" +
                    (i === copy.length - 1 ? " font-medium text-flare" : "")
                  }
                >
                  {line}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
