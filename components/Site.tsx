"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { FrameSequence } from "@/lib/frames";
import { getLite, subscribeLite } from "@/lib/lite";
import Preloader from "@/components/Preloader";
import Grain from "@/components/Grain";
import Hero from "@/components/Hero";
import StatsStrip from "@/components/StatsStrip";
import ChapterSection from "@/components/ChapterSection";
import Marquee from "@/components/Marquee";
import WorkCards from "@/components/WorkCards";
import Finale from "@/components/Finale";
import Footer from "@/components/Footer";

const CHAPTERS = [
  {
    clip: 2,
    index: "01",
    word: "BUILD",
    accent: "build" as const,
    copy: [
      "It started with a janky AI school counselor for a class project.",
      "Then DGPT — an AI bot of himself. The hook never let go.",
      "Now he ships full platforms solo, end to end.",
    ],
  },
  {
    clip: 3,
    index: "02",
    word: "OPERATE",
    accent: "operate" as const,
    copy: [
      "A $2.3M book of business at 22 — 67 clients and one enterprise.",
      "Retained $1.3M. Upsold $67K.",
      "Built the internal finance dashboard solo.",
    ],
  },
  {
    clip: 4,
    index: "03",
    word: "COMPETE",
    accent: "compete" as const,
    copy: [
      "Ten years of competitive tennis. 10.5 UTR, top 20 in Florida.",
      "NYU tennis — training 9 to 11pm. Poker on the side.",
      "He refuses to lose.",
    ],
  },
  {
    clip: 5,
    index: "04",
    word: "LIVE",
    accent: "live" as const,
    copy: [
      "EDM sets, new restaurants, new cities.",
      "Miami-raised, New York-made.",
      "The fuel for everything else.",
    ],
  },
];

export default function Site() {
  const [progress, setProgress] = useState(0);
  const [loadDone, setLoadDone] = useState(false);
  const [ready, setReady] = useState(false);
  const lite = useSyncExternalStore(subscribeLite, getLite, () => false);

  const seqs = useMemo(
    () =>
      new Map<number, FrameSequence>(
        [1, 2, 3, 4, 5].map((c) => [c, new FrameSequence(c)]),
      ),
    [],
  );

  // Preload behind the preloader (mode decided once, at mount):
  // full → all 100 hero frames; lite → just the five posters.
  useEffect(() => {
    const isLite = getLite();
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    let cancelled = false;

    const load = async () => {
      if (isLite) {
        const posters = [1, 2, 3, 4, 5].map(
          (c) =>
            new Promise<void>((res) => {
              const img = new Image();
              img.src = `/frames/clip-${c}/frame-001.webp`;
              img.onload = img.onerror = () => {
                setProgress((p) => Math.min(1, p + 0.2));
                res();
              };
            }),
        );
        await Promise.all(posters);
      } else {
        await seqs.get(1)!.load((loaded, total) => {
          if (!cancelled) setProgress(loaded / total);
        });
      }
      await fontsReady;
      if (!cancelled) setLoadDone(true);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [seqs]);

  // Lenis + ScrollTrigger wiring — full mode only, started after the reveal.
  useEffect(() => {
    if (!ready || lite) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [ready, lite]);

  const onRevealed = useCallback(() => setReady(true), []);

  return (
    <>
      {!ready && (
        <Preloader progress={progress} done={loadDone} onRevealed={onRevealed} />
      )}
      <Grain />
      <main>
        <Hero seq={seqs.get(1)!} ready={ready} lite={lite} />
        <StatsStrip />
        <ChapterSection {...CHAPTERS[0]} seq={seqs.get(2)!} lite={lite} />
        <ChapterSection {...CHAPTERS[1]} seq={seqs.get(3)!} lite={lite} />
        <Marquee />
        <ChapterSection {...CHAPTERS[2]} seq={seqs.get(4)!} lite={lite} />
        <ChapterSection {...CHAPTERS[3]} seq={seqs.get(5)!} lite={lite} />
        <Marquee />
        <WorkCards />
        <Finale lite={lite} />
        <Footer />
      </main>
    </>
  );
}
