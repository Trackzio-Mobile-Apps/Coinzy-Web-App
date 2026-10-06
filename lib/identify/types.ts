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

export type IdentifySuccess = {
  error: false;
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
};

export type IdentifyResponse = IdentifySuccess | IdentifyError;

export type IdentifySessionPayload = {
  imageUrls: string[];
  matches: IdentifyMatch[];
  /** Object URLs or remote URLs for the user's upload previews. */
  previewUrls: [string, string];
};
