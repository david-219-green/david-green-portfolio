"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import WeiModal from "@/components/WeiModal";

type Project = {
  title: string;
  line: string;
  meta: string;
  img: string;
  hoverImg?: string;
  tags: string[];
  href?: string;
  badge?: string;
};

// Hard rule: screenshots stay pixel-perfect — dressed with code only.
const PROJECTS: Project[] = [
  {
    title: "Frequency",
    line: "Rate every set you rave for.",
    meta: "Founder · 174 users in 25 days · beta capped at 100 + waitlist",
    img: "/assets/freq-hero.webp",
    hoverImg: "/assets/freq-rate.webp",
    tags: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Clerk",
      "Tailwind",
      "Vercel",
      "Spotify API",
      "EDMTrain API",
      "OpenAI API",
      "ranking algorithm",
    ],
    href: "https://frequency-app.tech/",
  },
  {
    title: "Job Tracker",
    line: "A job hunt that runs itself. A Claude agent logs everything.",
    meta: "Built to replace spreadsheets",
    img: "/assets/tracker-dash.webp",
    tags: [
      "Supabase",
      "Clerk",
      "Claude API",
      "AI agent",
      "Vercel",
      "A/B testing",
      "KPI dashboards",
      "outbound automation",
    ],
    href: "https://job-tracker-ashy-zeta.vercel.app/",
  },
  {
    // Clicking opens the WEI gate modal (production is client-private),
    // which then links out to the local demo build.
    title: "WEI",
    line: "Enterprise RAG knowledge platform, built under contract for SASI.",
    meta: "Contracted build",
    img: "/assets/wei-chat.webp",
    tags: [
      "Next.js",
      "Supabase",
      "Drizzle ORM",
      "pgvector",
      "RAG",
      "OCR ingestion",
      "Anthropic API",
      "citation engine",
      "LangSmith",
      "Sentry",
    ],
    badge: "Contracted",
  },
];

function TiltCard({ p, onClick }: { p: Project; onClick?: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power2.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power2.out" });

    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 12); // ≤6° each way
      rx(py * -12);
      glareRef.current?.style.setProperty(
        "background",
        `radial-gradient(500px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, color-mix(in srgb, var(--holo) 14%, transparent), transparent 60%)`,
      );
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  const inner = (
    <div
      ref={cardRef}
      data-card
      className="holo-frame group relative overflow-hidden bg-ink-soft opacity-0 will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={p.img}
          alt={`${p.title} — product screenshot`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={
            "object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.06]" +
            (p.hoverImg && hover ? " opacity-0" : " opacity-100")
          }
        />
        {p.hoverImg && (
          <Image
            src={p.hoverImg}
            alt={`${p.title} — secondary screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={
              "object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.06]" +
              (hover ? " opacity-100" : " opacity-0")
            }
          />
        )}
        <div className="scanlines pointer-events-none absolute inset-0" />
        {/* Soft reflection sheen */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-holo/8 to-transparent" />
        <div ref={glareRef} className="pointer-events-none absolute inset-0" />
        {p.badge && (
          <span className="absolute top-4 right-4 rounded-full border border-holo/40 bg-ink/70 px-3.5 py-1 font-mono text-xs tracking-[0.14em] text-holo uppercase">
            {p.badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-2xl tracking-wide uppercase md:text-3xl">
            {p.title}
          </h3>
          {(p.href || onClick) && (
            <span className="font-mono text-xs text-emerald transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          )}
        </div>
        <p className="text-paper/85">{p.line}</p>
        <p className="font-mono text-xs text-paper-dim">{p.meta}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-paper/15 px-2.5 py-0.5 font-mono text-xs text-paper-dim"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ perspective: "1000px" }}>
      {p.href ? (
        <a
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={p.title}
        >
          {inner}
        </a>
      ) : onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={p.title}
          className="block w-full cursor-pointer text-left"
        >
          {inner}
        </button>
      ) : (
        inner
      )}
    </div>
  );
}

// `lite` in the effect deps re-measures the trigger when the layout mode flips.
export default function WorkCards({ lite }: { lite: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [weiOpen, setWeiOpen] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      if (reduced) {
        gsap.set(cards, { autoAlpha: 1 });
        return;
      }
      const reset = () => {
        gsap.killTweensOf(cards);
        gsap.set(cards, { autoAlpha: 0, y: 60 });
      };
      const play = () => {
        reset();
        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
        });
      };
      reset();
      // Replays on every pass: reappears whenever it comes back on screen.
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 70%",
        end: "bottom top",
        onEnter: play,
        onEnterBack: play,
        onLeave: reset,
        onLeaveBack: reset,
      });
    }, ref);
    return () => ctx.revert();
  }, [lite]);

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <span className="type-eyebrow">Most Recent 3 Projects</span>
      <h2 className="type-chapter mt-3 mb-12">Work</h2>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="md:col-span-2">
          <TiltCard p={PROJECTS[0]} />
        </div>
        <TiltCard p={PROJECTS[1]} />
        <TiltCard p={PROJECTS[2]} onClick={() => setWeiOpen(true)} />
      </div>
      <WeiModal open={weiOpen} onClose={() => setWeiOpen(false)} />
    </section>
  );
}
