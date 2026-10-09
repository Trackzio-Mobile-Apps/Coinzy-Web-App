/** Dev-only sample media for Experts upload testing. */

export const EXPERTS_DEBUG_SAMPLE = {
  label: "India 5 Rupee · 1994 (+ generated edge)",
  obverseUrl: "/assets/identify/debug/obverse-5-rupee-1994.png",
  reverseUrl: "/assets/identify/debug/reverse-5-rupee-1994.png",
} as const;

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

async function canvasPng(
  filename: string,
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  w = 512,
  h = 512,
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  paint(ctx, w, h);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
  return new File([blob], filename, { type: "image/png" });
}

function blackPng(filename: string) {
  return canvasPng(filename, (ctx, w, h) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
  });
}

function edgeSamplePng() {
  return canvasPng("debug-edge-rim.png", (ctx, w, h) => {
    ctx.fillStyle = "#c4a574";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#8b6914";
    for (let y = 40; y < h - 40; y += 28) {
      ctx.fillRect(24, y, w - 48, 10);
    }
    ctx.fillStyle = "#1e1e1f";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EDGE / RIM", w / 2, h / 2);
  });
}

/** Real-looking coin photos (obverse/reverse from identify debug) + generated rim. */
export async function loadExpertsDebugSample(): Promise<{
  obverse: File;
  reverse: File;
  edge: File;
}> {
  const [obverse, reverse, edge] = await Promise.all([
    urlToFile(EXPERTS_DEBUG_SAMPLE.obverseUrl, "debug-obverse-5-rupee-1994.png"),
    urlToFile(EXPERTS_DEBUG_SAMPLE.reverseUrl, "debug-reverse-5-rupee-1994.png"),
    edgeSamplePng(),
  ]);
  return { obverse, reverse, edge };
}

/** Solid black stills — useful for “junk photo” / rejection paths. */
export async function loadExpertsBlankDebugSample(): Promise<{
  obverse: File;
  reverse: File;
  edge: File;
}> {
  const [obverse, reverse, edge] = await Promise.all([
    blackPng("debug-black-obverse.png"),
    blackPng("debug-black-reverse.png"),
    blackPng("debug-black-edge.png"),
  ]);
  return { obverse, reverse, edge };
}

/**
 * Tiny silent WebM (~1s) via MediaRecorder, or a 1×1 PNG renamed as fallback.
 * Experts API accepts video/*; duration is under the 10s cap.
 */
export async function loadExpertsDebugVideo(): Promise<File> {
  if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
    return blackPng("debug-fake-video-fallback.png");
  }

  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blackPng("debug-fake-video-fallback.png");

  const stream = canvas.captureStream(10);
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
    ? "video/webm;codecs=vp8"
    : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "";
  if (!mime) return blackPng("debug-fake-video-fallback.png");

  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 250_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  const done = new Promise<File>((resolve, reject) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mime.split(";")[0] });
      resolve(new File([blob], "debug-fake-coin.webm", { type: blob.type || "video/webm" }));
    };
    recorder.onerror = () => reject(new Error("MediaRecorder failed"));
  });

  recorder.start();
  const started = performance.now();
  const tick = () => {
    const t = (performance.now() - started) / 1000;
    ctx.fillStyle = `hsl(${(t * 40) % 360} 40% 25%)`;
    ctx.fillRect(0, 0, 320, 240);
    ctx.fillStyle = "#fff";
    ctx.font = "20px sans-serif";
    ctx.fillText("DEBUG VIDEO", 80, 120);
    if (t < 1.2) requestAnimationFrame(tick);
    else recorder.stop();
  };
  requestAnimationFrame(tick);
  return done;
}
