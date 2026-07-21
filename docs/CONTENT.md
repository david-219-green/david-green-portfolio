# Content spec — locked decisions (2026-07-20)

Single source of truth for the copy/UI overhaul. FULLY LOCKED and implemented; matches the code.

## Global rules
- No em-dashes anywhere in site copy. Use middots (·) or periods.
- Public numbers must match the resume: **$67K upsold** (resume's $87K is wrong), finance dashboard **built solo**, Frequency title **Founder**.
- Excluded by request: no "age 22" chip, no "shipped Leagues / +7% retention" mention.

## Preloader (replaces corner text + 000 counter)
- Centered **DG monogram stroke-draw**: DG mark drawn as emerald stroke mapped to real frame-load progress.
- On complete: stroke snaps solid → morphs into checkmark + green flare → full wipe, straight into hero.
- **0.8s anti-flash minimum**, no other lingering.

## Hero
- DELETE both eyebrows ("Portfolio — 2026", "NYC"). Name + tagline unchanged.

## Stats strip (5 stats, re-animate on EVERY viewport entry)
1. `$2.3M` / ARR managed
2. `174` / Frequency users in 25 days
3. `3.9` / GPA
4. `7` / platforms shipped
5. `106` / visitors before you  ← static const, easy manual edit

## Chapters — shared
- Eyebrow on all four: **"The Four Pillars of DG"** (no numbers).
- Side-content system: story beats + stat chips tied to scrub bands (UI variant OPEN).

## BUILD
- Left copy: unchanged (counselor → DGPT → ships solo).
- Right-side story beats (7, one at a time, approved):
  1. `13 sources scraped, 20,000 records structured. One school project that started everything.`
  2. `Then DGPT. An AI trained to talk like him.`
  3. `LIA at Lumen: prompt chained flows, 500+ test queries, 92% intent accuracy.`
  4. `Demoed to an SVP. Projected 20% lift in engagement.`
  5. `Lead Autopilot: 7 client microsites and a content engine running on Zapier and GPT.`
  6. `Frequency: a dual score engine, weighted rubric plus head to head rankings.`
  7. `WEI: ingestion to embeddings to citations. An enterprise brain, built solo.`

## OPERATE
- ARR ticker accent: DELETED.
- Copy: `Ran a real book of business and the systems behind it.` / `Retention, renewals, forecasting, tooling.` / `The operator who ships.` (green)
- Left-side story beats (approved; NO company-name prefixes by request):
  1. `Onboarded 68 accounts from signed contract to fully activated.`
  2. `Tore down the top 5 competitor apps. A/B tested 7 market sections, simplified 4.`
  3. `4 client accounts, AI conversation flows tuned for an 8% lift in lead response.`
  4. `When the tooling did not exist, he built it himself. Every company, same playbook.`
- Right-side chips: `$2.3M ARR managed` · `67 clients + 1 enterprise` · `$1.3M retained` · `$67K upsold` · `finance dashboard, built solo`

## TRACK RECORD section — "Where I've Operated" (between 2nd marquee and Work)
- Ledger rows, masked reveal once + emerald tick. Eyebrow "Track record".
- Rilla · Consumer Product Success Manager · Nov 2025 → May 2026 · `$2.3M book of business · $1.3M retained · $67K upsold · internal finance dashboard, built solo`
- Lumen · Software Developer Intern · Summer 2025 · `Built LIA, an agentic AI assistant · 500+ test queries at 92% intent accuracy · demoed to an SVP`
- Lead Autopilot AI · Product Management Intern · Oct 2024 → Apr 2025 · `7 client microsites shipped · AI conversation flows lifting lead response 8% · automated SEO content engine`
- Investing.com · Product Management Intern · Summer 2024 · `Competitive teardown of the top 5 rival apps · A/B tested personalization across 7 market sections · simplified 4`

## COMPETE
- Copy: `Ten years of competitive tennis at the top of the game.` / `Varsity college athlete. Competitive poker on the side.` / `He refuses to lose.` (green)
- Broadcast scoreboard (top-right, 7 rows, approved): UTR 10.5 · Florida Top 20 · Recruit ★★★ · Coach ATP #110 · State Semifinals · NYU Varsity · Season 17 Tournaments
- Chips punch in bottom-right after the serve flash (0.72+): `Magna Cum Laude` · `$15K+ in poker winnings` · `CourtSense · AI shot tracking · 4th at E-Labs`

## LIVE
- Copy unchanged.
- Genres: House Music · Tech House · Techno
- Artists: Mochakk · Franky Rizardo · Sidney Charles
- Travel: countries only → `28 countries`
- Festival lineup set-piece top-left (genres line + artist names in display caps).
- Right chips in order: `28 countries` · `Miami Heat, die hard` · `Gym Grind` · `Rafa and Alcaraz Super Fan` · `Absolute Foodie` · `Poker Grind` · `Spikeball` · `Building Tech`

## Marquee (both instances, ~44 items, locked)
Next.js · TypeScript · JavaScript · React · Python · SQL · Supabase · Postgres · pgvector · Drizzle ORM · Clerk · Tailwind · Vercel · CI/CD · GitHub · REST APIs · Claude API · OpenAI API · Anthropic API · RAG pipelines · embeddings · OCR ingestion · prompt chaining · AI agents · LangSmith · Sentry · web scraping · Pandas · Zapier · Twilio · SEO automation · ranking algorithms · product · team leading · Clay · HubSpot · outbound automation · data enrichment · KPI dashboards · A/B testing · AI evals · Amplitude · user research · roadmapping

## Work section
- Eyebrow: "Selected work" → **"Most Recent 3 Projects"**. Heading "Work" stays.
- No dashes in any card text.
- Job Tracker line: `A job hunt that runs itself. A Claude agent logs everything.`
- Tags:
  - Frequency: Next.js · TypeScript · Supabase · Clerk · Tailwind · Vercel · Spotify API · EDMTrain API · OpenAI API · ranking algorithm
  - Job Tracker: Supabase · Clerk · Claude API · AI agent · Vercel · A/B testing · KPI dashboards · outbound automation
  - WEI: Next.js · Supabase · Drizzle ORM · pgvector · RAG · OCR ingestion · Anthropic API · citation engine · LangSmith · Sentry

## Finale + page end
- Footer component DELETED (bottom marquee, name block, © row).
- Page scroll hard-stops at finale; glow peaks ~90% of pin.
- Final stretch reveals (reversible on scroll up):
  - bottom-left: `DAVID GREEN` + `NYU Stern · BTE + CS · New York City`
  - bottom-right: `© 2026`
- CTAs (Contact me / Download resume / socials) unchanged.
