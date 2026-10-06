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
