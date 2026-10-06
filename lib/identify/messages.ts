const BY_CODE: Record<string, { title: string; body: string }> = {
  E001: {
    title: "We couldn’t find a coin",
    body: "The photos don’t look like a coin. Try again with clear obverse and reverse shots on a plain background.",
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

export function identifyErrorMessage(code?: string, reason?: string) {
  if (code && BY_CODE[code]) return BY_CODE[code];
  return {
    title: "Identification failed",
    body: reason?.trim() || "Please try again with two clear coin photos.",
  };
}
