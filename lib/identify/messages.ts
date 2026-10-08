const BY_CODE: Record<string, { title: string; body: string }> = {
  E001: {
    title: "We couldn't identify this coin",
    body: "Coinzy AI can’t tell if this is a coin or not. Try taking a close photo of a single coin, front and back, and we'll try again.",
  },
  E002: {
    title: "Image too blurry",
    body: "Use brighter light and hold the camera steady so the lettering and rim are sharp.",
  },
  E003: {
    title: "Something went wrong",
    body: "Identification failed. Please try again in a moment.",
  },
  E004: {
    title: "AI limit reached",
    body: "You’ve used your free identifications for now. Upgrade to Premium or try again after the limit resets.",
  },
  E005: {
    title: "Check your photos",
    body: "Upload one obverse and one reverse photo of the same coin.",
  },
  E006: {
    title: "No close matches",
    body: "We couldn’t find similar coins in the catalogue. You can still browse the global catalogue.",
  },
};

/** True when the error should use the full-page failure UI (Figma `2098:158944`), not a toast. */
export function isInlineIdentifyFailure(code?: string, reason?: string): boolean {
  // Limits / generic transport errors stay as toasts.
  if (code === "E003" || code === "E004") return false;
  if (code === "E001" || code === "E002" || code === "E005" || code === "E006") return true;

  const r = (reason ?? "").toLowerCase();
  if (!r) return false;
  if (r.includes("limit") || r.includes("sign in") || r.includes("unauthorized") || r.includes("origin")) {
    return false;
  }
  // API often omits `aiErrorCode` and only sends reason (e.g. "Coin not detected!…").
  return (
    r.includes("not a coin") ||
    r.includes("not detected") ||
    r.includes("doesn't contain") ||
    r.includes("does not contain") ||
    r.includes("no coin") ||
    r.includes("blur") ||
    r.includes("can't tell") ||
    r.includes("cannot tell") ||
    r.includes("couldn") ||
    r.includes("real coins")
  );
}

export function identifyErrorMessage(code?: string, reason?: string) {
  if (code && BY_CODE[code]) return BY_CODE[code];
  // API sometimes returns detection failures without `aiErrorCode` — still use Figma E001 copy.
  if (isInlineIdentifyFailure(undefined, reason)) return BY_CODE.E001;
  return {
    title: "Identification failed",
    body: reason?.trim() || "Please try again with two clear coin photos.",
  };
}
