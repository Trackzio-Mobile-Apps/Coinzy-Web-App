import type { ArchetypeDetails } from "@/lib/api/coinzy";

function scalar(v: string | number | null | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : null;
  const s = v.trim();
  return s ? s : null;
}

function estimatedScalar(estimated: ArchetypeDetails["estimatedPrice"]): number | null {
  if (!estimated) return null;
  const raw = Object.values(estimated)[0];
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw === "string") {
    const n = Number.parseFloat(raw.split("-")[0]?.replace(/[^0-9.]/g, "") ?? "");
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export type AddCoinRequestBody = {
  collectionId?: string;
  name: string;
  currency: string;
  issuer: string;
  yearOfMinting: string;
  ruler: string;
  shape: string;
  rarity: string;
  estimatedPrice: number | null;
  weightGrams: string | number | null;
  diameterMm: string | number | null;
  thicknessMm: string | number | null;
  material: string | null;
  edgeType: string | null;
  technique: string | null;
  frontDesign: string | null;
  backDesign: string | null;
  inscriptions: string | null;
  context: string;
  mintLocation: string | null;
  isIdentified: boolean;
  isOwned: boolean;
  isWishlisted: boolean;
  imageUrls: [string, string];
  archetypeId: string;
  notes: string;
  rating?: number;
  comment?: string;
};

export function buildAddCoinPayload(
  coin: ArchetypeDetails,
  archetypeId: string,
  imageUrls: [string, string],
  opts: { isOwned: boolean; rating?: number; comment?: string },
): AddCoinRequestBody {
  return {
    name: coin.name,
    currency: scalar(coin.currency) ?? "",
    issuer: scalar(coin.issuer) ?? "",
    yearOfMinting: scalar(coin.yearOfMinting) ?? "",
    ruler: scalar(coin.ruler) ?? "",
    shape: scalar(coin.shape) ?? "",
    rarity: scalar(coin.rarity) ?? "COMMON",
    estimatedPrice: estimatedScalar(coin.estimatedPrice),
    weightGrams: coin.weightGrams,
    diameterMm: coin.diameterMm,
    thicknessMm: coin.thicknessMm,
    material: coin.material,
    edgeType: coin.edgeType,
    technique: coin.technique,
    frontDesign: coin.frontDesign,
    backDesign: coin.backDesign,
    inscriptions: coin.inscriptions,
    context: scalar(coin.context) ?? "",
    mintLocation: coin.mintLocation,
    isIdentified: true,
    isOwned: opts.isOwned,
    isWishlisted: false,
    imageUrls,
    archetypeId,
    notes: "",
    rating: opts.rating,
    comment: opts.comment,
  };
}
