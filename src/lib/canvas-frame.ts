// Shared canvas helpers for the scroll-scrubbed frame sequences.

export type Frame = HTMLImageElement;

/**
 * Loads a frame and decodes it up front, so drawing never stalls on a decode.
 * Deliberately an <img> and not an ImageBitmap: a few hundred bitmaps would pin
 * gigabytes of decoded pixels, while the browser can evict <img> data.
 */
export async function loadFrame(src: string): Promise<Frame | null> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  try {
    await img.decode();
    return img;
  } catch {
    return img.complete && img.naturalWidth > 0 ? img : null;
  }
}

/** Draws the frame cropped to fill the canvas (object-fit: cover). */
export function drawCover(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frame: Frame) {
  const iw = frame.naturalWidth;
  const ih = frame.naturalHeight;
  const scale = Math.max(canvas.width / iw, canvas.height / ih);
  const w = iw * scale;
  const h = ih * scale;
  ctx.drawImage(frame, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}
