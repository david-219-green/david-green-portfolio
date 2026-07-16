export const FRAME_COUNT = 100;

export const framePath = (clip: number, index: number) =>
  `/frames/clip-${clip}/frame-${String(index + 1).padStart(3, "0")}.webp`;

/** Mid-orbit poster used for mobile / reduced-motion fallbacks. */
export const posterPath = (clip: number) => framePath(clip, 0);

/**
 * Holds compressed HTMLImageElements for one clip's scrub sequence.
 * Images stay compressed in memory; the browser decodes near the playhead
 * (drawing the same 1600px frame repeatedly is cheap once cached).
 */
export class FrameSequence {
  images: (HTMLImageElement | null)[];
  loaded = 0;
  private listeners: ((loaded: number, total: number) => void)[] = [];
  private loading: Promise<void> | null = null;

  constructor(
    public clip: number,
    public count: number = FRAME_COUNT,
  ) {
    this.images = new Array(count).fill(null);
  }

  /**
   * Kick off loading every frame. Safe to call repeatedly (StrictMode
   * re-mounts): every caller's onProgress is registered and reported,
   * even when loading is already underway or finished.
   */
  load(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    if (onProgress) {
      this.listeners.push(onProgress);
      onProgress(this.loaded, this.count);
    }
    if (this.loading) return this.loading;
    this.loading = new Promise((resolve) => {
      let settled = 0;
      for (let i = 0; i < this.count; i++) {
        const img = new Image();
        img.src = framePath(this.clip, i);
        const done = () => {
          settled += 1;
          if (img.complete && img.naturalWidth > 0) {
            this.images[i] = img;
            this.loaded += 1;
          }
          for (const cb of this.listeners) cb(this.loaded, this.count);
          if (settled === this.count) resolve();
        };
        img.onload = done;
        img.onerror = done;
      }
    });
    return this.loading;
  }

  /** Best available frame at or below `index`, so scrubbing never blanks. */
  frameAt(index: number): HTMLImageElement | null {
    const i = Math.max(0, Math.min(this.count - 1, Math.round(index)));
    if (this.images[i]) return this.images[i];
    for (let d = 1; d < this.count; d++) {
      if (this.images[i - d]) return this.images[i - d];
      if (this.images[i + d]) return this.images[i + d];
    }
    return null;
  }
}

/** Cover-fit draw (canvas has no object-fit). Canvas must be dpr-sized. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
) {
  const { width: cw, height: ch } = ctx.canvas;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}
