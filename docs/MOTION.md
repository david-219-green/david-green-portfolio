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
- Progress = real count of hero frame `onload`s (192 frames) gated on `document.fonts.ready`; proxy tween `snap: 1` so the number never runs backward; counter in mono; minimum 1.8s on screen.
- Exit: counter y -100% 0.45s power2.in → overlay `clip-path inset(0 0 100% 0)` 1.1s expo.inOut; hero frame 0 painted *before* the wipe; tagline/scroll-cue fade in over the wipe's last 0.4s.

## Hero (pin 300vh, clip 1 orbit — 192 frames)
- Frames map linearly to full pin progress; one full 360° orbit per pin.
- 0–0.05 hold; **DAVID GREEN tracks in letter-by-letter over 0.05→0.60** (scrubbed, ease none — sync: name completes just past half-orbit); tagline persists bottom-left; scroll cue fades out by 0.08; 0.9→1 name drifts up slightly to hand off.

## Chapters 01–04 (pin 250vh each, clips 2–5 — 192 frames each)
- Bands: 0–0.08 settle · 0.06–0.30 index + chapter word scrub in (y + opacity) · copy lines masked-reveal (triggered once at 0.22, 0.9s, stagger 0.07, expo.out) · 0.80–1 title exits up (scrubbed).
- One accent mechanic per chapter, same skeleton: BUILD glyph-drift · OPERATE $0→$2.3M mono counter tied to scrub · COMPETE impact flash at ~0.7 · LIVE emerald flood rising with progress.
- Frames lazy-load via IntersectionObserver (rootMargin 150%) — never block first paint.

## Stats / Work / Finale
- Stats: count-up 1.2s power1.out `snap: 1`, stagger 0.08, fire **once** at `top 65%` — an event, not a slider.
- Work cards: enter y 60→0 / autoAlpha 0.8s power3.out stagger 0.1; 3D tilt ≤6°, glare follows cursor; image hover scale 1.06 / 0.6s power2.out.
- Finale: pin 200vh; "NOT BUILT TO LOSE." scrubs scale 0.92→1 + tracking wide→tight + opacity 0.35→1; emerald radial flare blooms 0.6→1; CTAs (magnetic, lerp 0.15, max 24px) appear at 0.75.

## Safety rails
- Grain overlay 6% opacity, pointer-events none, everywhere.
- `prefers-reduced-motion` OR viewport <768px: no pins/scrubs — poster frames, 0.4s fades, counters still count.
- `invalidateOnRefresh: true` on every pinned trigger; masked text via overflow-hidden wrappers + transforms only.
- Frame budget ≤20MB per clip (192 × 2560px WebP, extracted from 4K AI-upscaled masters — ByteDance `aigc` preset via Higgsfield); hold compressed Images, draw with cover-fit math + `imageSmoothingQuality: high` on dpr-sized canvas.
