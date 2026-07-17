"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useState } from "react";
import Magnetic from "@/components/Magnetic";
import ContactModal from "@/components/ContactModal";
import SocialStack from "@/components/SocialStack";

/**
 * Pin 200vh. "NOT BUILT TO LOSE." scrubs scale 0.92→1 + tracking wide→tight
 * + opacity 0.35→1; emerald radial flare blooms 0.6→1; CTAs appear at 0.75.
 */
export default function Finale({ lite }: { lite: boolean }) {
  const [contactOpen, setContactOpen] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLHeadingElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!outerRef.current) return;

    if (lite) {
      const ctx = gsap.context(() => {
        gsap.from([lineRef.current, ctaRef.current], {
          autoAlpha: 0,
          y: 24,
          duration: 0.4,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: outerRef.current, start: "top 60%", once: true },
        });
        gsap.set(flareRef.current, { autoAlpha: 0.7 });
      }, outerRef);
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      tl.fromTo(
        lineRef.current,
        { scale: 0.92, letterSpacing: "0.04em", autoAlpha: 0.35 },
        { scale: 1, letterSpacing: "-0.01em", autoAlpha: 1, duration: 0.75 },
        0,
      ).fromTo(
        flareRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4 },
        0.6,
      );

      let ctaPlayed = false;
      const ctaIn = () => {
        if (ctaPlayed) return;
        ctaPlayed = true;
        gsap.fromTo(
          ctaRef.current,
          { y: 16, autoAlpha: 0 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
        );
      };

      ScrollTrigger.create({
        trigger: outerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          tl.progress(self.progress);
          if (self.progress > 0.75) ctaIn();
        },
      });
    }, outerRef);
    return () => ctx.revert();
  }, [lite]);

  return (
    <section ref={outerRef} className={lite ? "relative" : "relative h-[200vh]"} id="contact">
      <div
        className={
          (lite ? "relative min-h-svh" : "sticky top-0 h-screen") +
          " flex flex-col items-center justify-center overflow-hidden bg-ink"
        }
      >
        <div
          ref={flareRef}
          aria-hidden
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--emerald-flare) 28%, transparent), transparent 60%)",
          }}
        />
        <h2
          ref={lineRef}
          className="type-chapter relative z-10 px-6 text-center"
        >
          Not built <span className="text-flare">to lose.</span>
        </h2>
        <div
          ref={ctaRef}
          className={
            "relative z-10 mt-12 flex flex-col items-center gap-9" +
            (lite ? "" : " opacity-0")
          }
        >
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Magnetic>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-block cursor-pointer border border-emerald bg-emerald/10 px-8 py-4 font-mono text-sm tracking-[0.14em] text-flare uppercase transition-colors duration-300 hover:bg-emerald hover:text-ink"
              >
                Contact me
              </button>
            </Magnetic>
            <Magnetic>
              <a
                href="/resume.pdf"
                download="David Green Resume.pdf"
                className="inline-block border border-paper/25 px-8 py-4 font-mono text-sm tracking-[0.14em] text-paper uppercase transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
              >
                Download resume
              </a>
            </Magnetic>
          </div>
          <SocialStack />
        </div>
        <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    </section>
  );
}
