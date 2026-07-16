const SKILLS = [
  "Next.js",
  "TypeScript",
  "Supabase",
  "Tailwind",
  "Claude API",
  "RAG pipelines",
  "Vercel",
  "Product",
  "Python",
];

/** Slow skills marquee strip placed between major sections. */
export default function Marquee() {
  const row = SKILLS.map((s) => `${s} · `).join(" ");
  return (
    <div className="overflow-hidden border-y border-paper/10 py-4">
      <div className="marquee-track flex w-max whitespace-nowrap">
        {[0, 1].map((i) => (
          <span
            key={i}
            aria-hidden={i === 1}
            className="font-mono text-sm uppercase tracking-[0.2em] text-paper-dim"
          >
            {row}
            &nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}
