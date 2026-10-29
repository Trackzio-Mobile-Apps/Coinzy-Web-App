/** `POST /ai/identify-v2` match row (see docs/coinid-api.md). */
export type IdentifyMatch = {
  name: string;
  currency?: string | null;
  issuer?: string | null;
  yearOfMinting?: string | number | null;
  ruler?: string | null;
  shape?: string | null;
  rarity?: string | null;
  archetypeId: string;
  archetypeImageUrls?: string[];
  matchScore?: string;
  estimatedPrice?: Record<string, string> | null;
};

import type { ScanUsage } from "@/lib/identify/scanUsage";

export type IdentifySuccess = {
  error: false;
  /** Server AI-scan counters after this scan (when the backend sends them). */
  usage?: ScanUsage | null;
  data: {
    imageUrls: string[];
    matchesFoundCount: number;
    matches: IdentifyMatch[];
  };
};

export type IdentifyError = {
  error: true;
  reason?: string;
  aiErrorCode?: string;
  resetsAt?: number;
  usage?: ScanUsage | null;
};

export type IdentifyResponse = IdentifySuccess | IdentifyError;

export type IdentifySessionPayload = {
  imageUrls: string[];
  matches: IdentifyMatch[];
  /** Object URLs or remote URLs for the user's upload previews. */
  previewUrls: [string, string];
};
