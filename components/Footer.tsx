import Marquee from "@/components/Marquee";

export default function Footer() {
  return (
    <footer className="bg-ink">
      <Marquee />
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
        <div className="flex flex-col gap-1">
          <span className="font-display text-xl tracking-wide uppercase">
            David Green
          </span>
          <span className="font-mono text-xs text-paper-dim">
            NYU Stern — BTE + CS · New York City
          </span>
        </div>
        <nav className="flex gap-8">
          <a
            href="https://github.com/david-219-green"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-paper-dim transition-colors hover:text-flare"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/david-green-499239290"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-paper-dim transition-colors hover:text-flare"
          >
            LinkedIn
          </a>
          <a
            href="mailto:dmg9769@stern.nyu.edu"
            className="font-mono text-sm text-paper-dim transition-colors hover:text-flare"
          >
            Email
          </a>
        </nav>
        <span className="font-mono text-xs text-paper-dim">
          © 2026 — built, not bought
        </span>
      </div>
    </footer>
  );
}
