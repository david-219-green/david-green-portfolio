# Motion-design plan

Distilled from research on Lando Norris (OFF+BRAND, Awwwards SOTY 2025 — Codrops breakdown of its scrubbed MotionPath hero), Igloo Inc (SOTY 2024), Trionn, OPTIKKA and Joffrey Spitzer Codrops engineering write-ups. We emulate the craft, not the content.

## Global system
- **Lenis**: `duration 1.15`, exponential-out easing, `smoothWheel: true`. Canonical wiring:
  `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)`.
  Lenis starts only after the preloader reveal completes.
- **Ease vocabulary (only these)**: `expo.out` text entries · `power2.out` micro/UI · `power2.in` exits · `expo.inOut` wipes & preloader · `none` for everything scrubbed. Scrub IS the easing; never ease inside a scrub.
- **Scrub smoothing**: `scrub: true` (raw) + per-frame lerp `0.12–0.15` on the *rendered* canvas frame (Trionn pattern) — smoothing at render level, not scroll level, so Lenis + scrub never double-smooth.
- **Type scale**: hero `clamp(4rem, 13vw, 15rem)` @ line-height 0.86, tracking -0.02em; chapter titles `clamp(2.5rem, 8vw, 9rem)`; eyebrows 11px uppercase +0.14em; body 17px/1.6. Three tiers only.
- **Pin budget**: hero 300vh + 4 chapters × 250vh + finale 200vh ≈ 1500vh pinned, ~2800vh total page. Breathers (marquee strips, stats, work) are unpinned.

## Preloader → hero
- Centered DG monogram: SVG strokes (pathLength 100) drawn by real hero-frame load progress (192 frames), gated on `document.fonts.ready`; proxy tween so the stroke never runs backward; 0.8s anti-flash minimum.
- Exit: stroke snaps complete 0.2s → glow flare + monogram dims while a checkmark draws 0.35s power2.out → overlay `clip-path inset(0 0 100% 0)` 0.7s expo.inOut; hero frame 0 painted *before* the wipe.

## Hero (pin 300vh, clip 1 orbit — 192 frames)
- Frames map linearly to full pin progress; one full 360° orbit per pin.
- 0–0.05 hold; **DAVID GREEN tracks in letter-by-letter over 0.05→0.60** (scrubbed, ease none — sync: name completes just past half-orbit); tagline persists bottom-left; scroll cue fades out by 0.08; 0.9→1 name drifts up slightly to hand off.

## Chapters 01–04 (pin 250vh each, clips 2–5 — 192 frames each)
- Bands: 0–0.08 settle · 0.06–0.30 index + chapter word scrub in (y + opacity) · copy lines masked-reveal (triggered once at 0.22, 0.9s, stagger 0.07, expo.out) · 0.80–1 title exits up (scrubbed).
- Accent mechanics: BUILD glyph-drift · COMPETE impact flash at ~0.7 · LIVE emerald flood rising with progress (OPERATE counter removed — chips carry the numbers).
- Side layer per chapter: story beats one-at-a-time 0.15→0.82 (masked swap) · chips accumulate from 0.24 step 0.07 (COMPETE chips punch at 0.72 post-flash) · set-pieces (COMPETE scoreboard, LIVE lineup) build 0.16→0.6 · all side layers fade by 0.9. Lite mode renders chips/scoreboard/lineup as static rows; beats are desktop-only.
- Frames lazy-load via IntersectionObserver (rootMargin 150%) — never block first paint.

## Stats / Track record / Work / Finale
- Stats (5): count-up 1.2s power1.out, stagger 0.08, fire on EVERY entry at the strip's first visible pixel (start "top bottom") and reset only once fully off-screen — zeros are never visible on screen; replays each pass. Visitors stat is live in production (/api/visits, Upstash Redis, +1 per browser per day, static 106 fallback).
- Track record ("Where I've Operated"): rows y 28→0 / autoAlpha 0.7s power3.out stagger 0.12 + emerald tick scaleY, once at top 70%.
- Work cards: enter y 60→0 / autoAlpha 0.8s power3.out stagger 0.1; 3D tilt ≤6°, glare follows cursor; image hover scale 1.06 / 0.6s power2.out.
- Finale (LAST section — footer removed, page hard-stops here): pin 200vh; "NOT BUILT TO LOSE." scrubs scale 0.92→1 + tracking wide→tight + opacity 0.35→1; emerald radial flare blooms 0.6→1; CTAs (magnetic, lerp 0.15, max 24px) appear at 0.75; sign-off (name + school bottom-left, © 2026 bottom-right) scrubs in 0.9→1, reversible.

## Safety rails
- Scroll is locked (body overflow hidden) while the preloader is up. `ScrollTrigger.refresh()` runs post-reveal in BOTH modes, and Stats/TrackRecord/WorkCards effects depend on `lite` — the SSR full-mode layout collapses when the lite flip lands, so triggers must re-measure or they listen at stale positions (the mobile stuck-at-zero bug).
- Grain overlay 6% opacity, pointer-events none, everywhere.
- `prefers-reduced-motion` OR viewport <768px: no pins/scrubs — poster frames, 0.4s fades, counters still count.
- `invalidateOnRefresh: true` on every pinned trigger; masked text via overflow-hidden wrappers + transforms only.
- Frame budget ≤20MB per clip (192 × 2560px WebP, extracted from 4K AI-upscaled masters — ByteDance `aigc` preset via Higgsfield); hold compressed Images, draw with cover-fit math + `imageSmoothingQuality: high` on dpr-sized canvas.
