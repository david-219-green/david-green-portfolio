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
import ChapterSection, {
  type Accent,
  type Beats,
  type Chips,
  type Lineup,
  type Scoreboard,
} from "@/components/ChapterSection";
import Marquee from "@/components/Marquee";
import TrackRecord from "@/components/TrackRecord";
import WorkCards from "@/components/WorkCards";
import Finale from "@/components/Finale";

type Chapter = {
  clip: number;
  word: string;
  accent: Accent;
  copy: string[];
  beats?: Beats;
  chips?: Chips;
  scoreboard?: Scoreboard;
  lineup?: Lineup;
};

const CHAPTERS: Chapter[] = [
  {
    clip: 2,
    word: "BUILD",
    accent: "build",
    copy: [
      "It started with a janky AI school counselor for a class project.",
      "Then DGPT — an AI bot of himself. The hook never let go.",
      "Now he ships full platforms solo, end to end.",
    ],
    beats: {
      side: "right",
      lines: [
        "13 sources scraped, 20,000 records structured. One school project that started everything.",
        "Then DGPT. An AI trained to talk like him.",
        "LIA at Lumen: prompt chained flows, 500+ test queries, 92% intent accuracy.",
        "Demoed to an SVP. Projected 20% lift in engagement.",
        "Lead Autopilot: 7 client microsites and a content engine running on Zapier and GPT.",
        "Frequency: a dual score engine, weighted rubric plus head to head rankings.",
        "WEI: ingestion to embeddings to citations. An enterprise brain, built solo.",
      ],
    },
  },
  {
    clip: 3,
    word: "OPERATE",
    accent: "operate",
    copy: [
      "Ran a real book of business and the systems behind it.",
      "Retention, renewals, forecasting, tooling.",
      "The operator who ships.",
    ],
    beats: {
      side: "left",
      lines: [
        "Onboarded 68 accounts from signed contract to fully activated.",
        "Tore down the top 5 competitor apps. A/B tested 7 market sections, simplified 4.",
        "4 client accounts, AI conversation flows tuned for an 8% lift in lead response.",
        "When the tooling did not exist, he built it himself. Every company, same playbook.",
      ],
    },
    chips: {
      side: "right",
      items: [
        "$2.3M ARR managed",
        "67 clients + 1 enterprise",
        "$1.3M retained",
        "$67K upsold",
        "finance dashboard, built solo",
      ],
    },
  },
  {
    clip: 4,
    word: "COMPETE",
    accent: "compete",
    copy: [
      "Ten years of competitive tennis at the top of the game.",
      "Varsity college athlete. Competitive poker on the side.",
      "He refuses to lose.",
    ],
    scoreboard: {
      title: "David Green",
      rows: [
        ["UTR", "10.5"],
        ["Florida", "Top 20"],
        ["Recruit", "★★★"],
        ["Coach", "ATP #110"],
        ["State", "Semifinals"],
        ["NYU", "Varsity"],
        ["Season", "17 Tournaments"],
      ],
    },
    chips: {
      side: "right",
      pos: "bottom",
      start: 0.72,
      step: 0.05,
      items: [
        "Magna Cum Laude",
        "$15K+ in poker winnings",
        "CourtSense · AI shot tracking · 4th at E-Labs",
      ],
    },
  },
  {
    clip: 5,
    word: "LIVE",
    accent: "live",
    copy: [
      "EDM sets, new restaurants, new cities.",
      "Miami-raised, New York-made.",
      "The fuel for everything else.",
    ],
    lineup: {
      genres: "House Music · Tech House · Techno",
      artists: ["Mochakk", "Franky Rizardo", "Sidney Charles"],
      dining: {
        label: "Best DG Restaurants of All Time",
        spots: [
          { name: "Maido", city: "Lima, Peru" },
          { name: "Leña", city: "Dubai" },
          { name: "Imperial Treasure", city: "London" },
          { name: "Black Cow", city: "Singapore" },
          { name: "Hillstone", city: "Miami" },
        ],
      },
    },
    chips: {
      side: "right",
      items: [
        "28 countries",
        "Miami Heat, die hard",
        "Gym Grind",
        "Rafa and Alcaraz Super Fan",
        "Absolute Foodie",
        "Poker Grind",
        "Spikeball",
        "Building Tech",
      ],
    },
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
  // full → all 192 hero frames; lite → just the five posters.
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

  // Scroll is locked while the preloader overlay is up — nobody starts the
  // story mid-page, and no triggers fire beneath the overlay.
  useEffect(() => {
    if (ready) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [ready]);

  // After the reveal, re-measure every trigger against the settled layout —
  // BOTH modes. (The lite flip collapses the page from the SSR full-mode
  // layout; skipping this left mobile triggers at stale positions.)
  useEffect(() => {
    if (!ready) return;
    if (lite) {
      ScrollTrigger.refresh();
      return;
    }
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // Modals pause smooth scroll while open (see components/Modal.tsx).
    const onModal = (e: Event) => {
      if ((e as CustomEvent).detail?.open) lenis.stop();
      else lenis.start();
    };
    window.addEventListener("modal-toggle", onModal);
    ScrollTrigger.refresh();
    return () => {
      window.removeEventListener("modal-toggle", onModal);
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
        <StatsStrip lite={lite} />
        <ChapterSection {...CHAPTERS[0]} seq={seqs.get(2)!} lite={lite} />
        <ChapterSection {...CHAPTERS[1]} seq={seqs.get(3)!} lite={lite} />
        <Marquee />
        <ChapterSection {...CHAPTERS[2]} seq={seqs.get(4)!} lite={lite} />
        <ChapterSection {...CHAPTERS[3]} seq={seqs.get(5)!} lite={lite} />
        <Marquee />
        <TrackRecord lite={lite} />
        <WorkCards lite={lite} />
        <Finale lite={lite} />
      </main>
    </>
  );
}
