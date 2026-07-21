const SKILLS = [
  "Next.js",
  "TypeScript",
  "JavaScript",
  "React",
  "Python",
  "SQL",
  "Supabase",
  "Postgres",
  "pgvector",
  "Drizzle ORM",
  "Clerk",
  "Tailwind",
  "Vercel",
  "CI/CD",
  "GitHub",
  "REST APIs",
  "Claude API",
  "OpenAI API",
  "Anthropic API",
  "RAG pipelines",
  "embeddings",
  "OCR ingestion",
  "prompt chaining",
  "AI agents",
  "LangSmith",
  "Sentry",
  "web scraping",
  "Pandas",
  "Zapier",
  "Twilio",
  "SEO automation",
  "ranking algorithms",
  "product",
  "team leading",
  "Clay",
  "HubSpot",
  "outbound automation",
  "data enrichment",
  "KPI dashboards",
  "A/B testing",
  "AI evals",
  "Amplitude",
  "user research",
  "roadmapping",
];

/**
 * Slow skills marquee strip placed between major sections. The list is far
 * wider than any viewport on purpose — you only ever see a slice rotating by.
 */
export default function Marquee() {
  const row = SKILLS.map((s) => `${s} · `).join(" ");
  return (
    <div className="overflow-hidden border-y border-paper/10 py-4">
      <div
        className="marquee-track flex w-max whitespace-nowrap"
        style={{ animationDuration: "300s" }}
      >
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
