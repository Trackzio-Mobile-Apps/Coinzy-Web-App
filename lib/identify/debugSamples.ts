/** Fixed obverse/reverse pair for local identify API testing (India 5 Rupee, 1994). */
export const IDENTIFY_DEBUG_SAMPLE = {
  label: "India 5 Rupee · 1994",
  obverseUrl: "/assets/identify/debug/obverse-5-rupee-1994.png",
  reverseUrl: "/assets/identify/debug/reverse-5-rupee-1994.png",
} as const;

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const blob = await res.blob();
  const type = blob.type || "image/png";
  return new File([blob], filename, { type });
}

export async function loadIdentifyDebugSample(): Promise<{ obverse: File; reverse: File }> {
  const [obverse, reverse] = await Promise.all([
    urlToFile(IDENTIFY_DEBUG_SAMPLE.obverseUrl, "debug-obverse-5-rupee-1994.png"),
    urlToFile(IDENTIFY_DEBUG_SAMPLE.reverseUrl, "debug-reverse-5-rupee-1994.png"),
  ]);
  return { obverse, reverse };
}

/** Plain black PNGs — should trigger identify failure (e.g. E001) for UI testing. */
export async function loadIdentifyBlankDebugSample(): Promise<{
  obverse: File;
  reverse: File;
}> {
  const blackFile = async (filename: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 512, 512);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    });
    return new File([blob], filename, { type: "image/png" });
  };
  const [obverse, reverse] = await Promise.all([
    blackFile("debug-black-obverse.png"),
    blackFile("debug-black-reverse.png"),
  ]);
  return { obverse, reverse };
}
