"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { FrameSequence, drawCover } from "@/lib/frames";

/**
 * Full-bleed canvas that renders `seq` at a frame driven by `progressRef`
 * (0..1). The rendered frame lerps toward the target each tick (0.15/frame)
 * — smoothing at render level, not scroll level, per docs/MOTION.md.
 */
export default function ScrubCanvas({
  seq,
  progressRef,
  className,
}: {
  seq: FrameSequence;
  progressRef: React.RefObject<number>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rendered = -1; // force first paint
    let drawnImg: HTMLImageElement | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      if (drawnImg) drawCover(ctx, drawnImg);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = () => {
      const target = progressRef.current * (seq.count - 1);
      if (rendered < 0) rendered = target;
      rendered += (target - rendered) * 0.15;
      if (Math.abs(target - rendered) < 0.02) rendered = target;
      const img = seq.frameAt(rendered);
      if (img && (img !== drawnImg || Math.abs(rendered - target) > 0.01)) {
        drawnImg = img;
        drawCover(ctx, img);
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
    };
  }, [seq, progressRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
