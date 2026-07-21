"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { FrameSequence, posterPath } from "@/lib/frames";
import { getLite } from "@/lib/lite";
import ScrubCanvas from "@/components/ScrubCanvas";

export type Accent = "build" | "operate" | "compete" | "live";

export type Beats = { side: "left" | "right"; lines: string[] };
export type Chips = {
  side: "left" | "right";
  pos?: "top" | "bottom";
  start?: number;
  step?: number;
  items: string[];
};
export type Scoreboard = { title: string; rows: [string, string][] };
export type Lineup = { genres: string; artists: string[] };

const GLYPHS = "⌁◇⟢∆⌗◈⟡∇⌬◆⟠"; // abstract drift for BUILD — never legible words

/**
 * Pinned 250vh chapter over a clip scrub. Bands per docs/MOTION.md:
 * 0.06–0.30 eyebrow+word scrub in · copy masked-reveal fired once at 0.22 ·
 * 0.80–1 title exits. Side layer: story beats one-at-a-time 0.15→0.82,
 * chips accumulate from `start` (default 0.24), set-pieces (scoreboard /
 * lineup) build 0.16→0.6 — all side layers fade by 0.9.
 */
export default function ChapterSection({
  seq,
  clip,
  word,
  copy,
  accent,
  lite,
  beats,
  chips,
  scoreboard,
  lineup,
}: {
  seq: FrameSequence;
  clip: number;
  word: string;
  copy: string[];
  accent: Accent;
  lite: boolean;
  beats?: Beats;
  chips?: Chips;
  scoreboard?: Scoreboard;
  lineup?: Lineup;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const liteAsideRef = useRef<HTMLDivElement>(null);
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
    const root = outerRef.current;
    const lines = copyRef.current?.querySelectorAll<HTMLElement>("[data-line]");

    if (lite) {
      // Poster + one triggered fade — no pins, no scrubs.
      const ctx = gsap.context(() => {
        gsap.from(
          [
            wordRef.current,
            ...(lines ? Array.from(lines) : []),
            ...(liteAsideRef.current ? [liteAsideRef.current] : []),
          ],
          {
            autoAlpha: 0,
            y: 24,
            duration: 0.4,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: root, start: "top 70%", once: true },
          },
        );
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
        eyebrowRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.1 },
        0.06,
      )
        .to(chars, { yPercent: 0, duration: 0.14, stagger: 0.02 }, 0.08)
        .to(
          [wordRef.current, eyebrowRef.current],
          { yPercent: -50, autoAlpha: 0, duration: 0.18 },
          0.82,
        );

      // Accent mechanics — one varying element per chapter.
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

      // Story beats: masked lines reveal one by one in their FINAL positions
      // and accumulate — the full stack is visible by ~0.75, the whole block
      // fades with the other side layers at 0.9.
      const beatsBox = root.querySelector<HTMLElement>("[data-beats]");
      const beatEls = root.querySelectorAll<HTMLElement>("[data-beat]");
      if (beatsBox && beatEls.length) {
        gsap.set(beatEls, { yPercent: 110 });
        const bStart = 0.18;
        const bStep = (0.75 - bStart) / beatEls.length;
        beatEls.forEach((el, i) => {
          tl.to(el, { yPercent: 0, duration: 0.05 }, bStart + i * bStep);
        });
        tl.to(beatsBox, { autoAlpha: 0, duration: 0.05 }, 0.9);
      }

      // Chips: accumulate one by one, exit together at 0.9.
      const chipEls = root.querySelectorAll<HTMLElement>("[data-chip]");
      if (chipEls.length && chips) {
        const dx = chips.side === "right" ? 24 : -24;
        const cStart = chips.start ?? 0.24;
        const cStep = chips.step ?? 0.07;
        gsap.set(chipEls, { autoAlpha: 0, x: dx });
        chipEls.forEach((el, i) => {
          tl.to(el, { autoAlpha: 1, x: 0, duration: 0.05 }, cStart + i * cStep);
        });
        tl.to(chipEls, { autoAlpha: 0, duration: 0.05 }, 0.9);
      }

      // Scoreboard set-piece: box in, rows build, fade at 0.9.
      const scoreBox = root.querySelector<HTMLElement>("[data-scorebox]");
      const scoreRows = root.querySelectorAll<HTMLElement>("[data-scorerow]");
      if (scoreBox) {
        gsap.set(scoreBox, { autoAlpha: 0, y: 16 });
        gsap.set(scoreRows, { yPercent: 110 });
        tl.to(scoreBox, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.16);
        scoreRows.forEach((el, i) => {
          tl.to(el, { yPercent: 0, duration: 0.045 }, 0.22 + i * 0.05);
        });
        tl.to(scoreBox, { autoAlpha: 0, duration: 0.05 }, 0.9);
      }

      // Lineup set-piece: genres then artists cascade, fade at 0.9.
      const lineupBox = root.querySelector<HTMLElement>("[data-lineup]");
      const lineupItems = root.querySelectorAll<HTMLElement>("[data-lineup-item]");
      if (lineupBox) {
        gsap.set(lineupItems, { yPercent: 110 });
        lineupItems.forEach((el, i) => {
          tl.to(el, { yPercent: 0, duration: 0.05 }, 0.18 + i * 0.06);
        });
        tl.to(lineupBox, { autoAlpha: 0, duration: 0.05 }, 0.9);
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
        trigger: root,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lite, accent]);

  // Compact fallback rows for lite mode (beats stay desktop-only).
  const liteAside: string[] = [
    ...(scoreboard ? scoreboard.rows.map(([k, v]) => `${k} ${v}`) : []),
    ...(lineup ? [lineup.genres, ...lineup.artists] : []),
    ...(chips ? chips.items : []),
  ];

  const chipPosClass =
    chips?.pos === "bottom"
      ? "bottom-28 md:bottom-36"
      : "top-[26%]";
  const chipSideClass =
    chips?.side === "right"
      ? "right-6 md:right-12 items-end"
      : "left-6 md:left-12 items-start";

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

        {/* Side layer: story beats — a vertically centered stack; each line
            masked-reveals in place and stays (desktop full mode only) */}
        {!lite && beats && (
          <div
            data-beats
            className={
              "pointer-events-none absolute inset-y-0 z-10 hidden w-[min(28rem,38vw)] flex-col justify-center gap-3 md:flex " +
              (beats.side === "right"
                ? "right-6 md:right-12 text-right"
                : // left side shares its column with the copy block below —
                  // bias the centered stack upward so they never crowd.
                  "left-6 md:left-12 pb-[26vh] text-left")
            }
          >
            {beats.lines.map((line, i) => (
              <div key={i} className="overflow-hidden">
                <p
                  data-beat
                  className="text-lg leading-snug font-medium text-paper/90 md:text-xl"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.85)" }}
                >
                  {line}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Side layer: chips */}
        {!lite && chips && (
          <div
            className={`pointer-events-none absolute z-10 hidden flex-col gap-3 md:flex ${chipPosClass} ${chipSideClass}`}
          >
            {chips.items.map((c) => (
              <span
                key={c}
                data-chip
                className="font-sans rounded-full border border-holo/25 bg-ink/45 px-4 py-2 text-[11px] font-medium tracking-[0.12em] text-paper/90 uppercase md:text-xs"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Side layer: broadcast scoreboard (COMPETE) */}
        {!lite && scoreboard && (
          <div
            data-scorebox
            className="pointer-events-none absolute top-[13%] right-6 z-10 hidden w-64 rounded-2xl border border-paper/20 bg-ink/55 p-4 font-mono md:right-12 md:block md:w-72"
          >
            {/* Space Grotesk here — MuseoModerno's uppercase G reads as Q. */}
            <div className="font-sans mb-2 border-b border-paper/15 pb-2 text-xs font-semibold tracking-[0.2em] text-flare uppercase">
              {scoreboard.title}
            </div>
            {scoreboard.rows.map(([label, value]) => (
              <div key={label} className="overflow-hidden">
                <div
                  data-scorerow
                  className="flex justify-between py-1 text-[11px] tracking-[0.1em] uppercase md:text-xs"
                >
                  <span className="text-paper-dim">{label}</span>
                  <span className="text-flare">{value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Side layer: festival lineup (LIVE) */}
        {!lite && lineup && (
          <div
            data-lineup
            className="pointer-events-none absolute top-[20%] left-6 z-10 hidden md:left-12 md:block"
          >
            <div className="mb-3 overflow-hidden">
              <div
                data-lineup-item
                className="font-mono text-[11px] tracking-[0.22em] text-flare uppercase"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
              >
                {lineup.genres}
              </div>
            </div>
            {lineup.artists.map((a) => (
              <div key={a} className="overflow-hidden">
                <div
                  data-lineup-item
                  className="font-display text-2xl leading-tight tracking-wide text-paper/90 uppercase md:text-4xl"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.85)" }}
                >
                  {a}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative z-20 p-6 pb-12 md:p-12 md:pb-16">
          <span ref={eyebrowRef} className="type-eyebrow block">
            The Four Pillars of DG
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
          {lite && liteAside.length > 0 && (
            <div ref={liteAsideRef} className="mt-5 flex max-w-lg flex-wrap gap-2">
              {liteAside.map((t) => (
                <span
                  key={t}
                  className="font-sans rounded-full border border-holo/25 px-3 py-1 text-[10px] font-medium tracking-[0.1em] text-paper/80 uppercase"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
