import type { AddCoinRequestBody } from "@/lib/identify/addCoinPayload";

/** `GET /api/collections/fetchAll` row (custom / private collections). */
export type ApiPrivateCollection = {
  collectionId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  representativeImages?: string[];
  coinCount?: number;
};

export type CollectionsFetchPayload = {
  data: ApiPrivateCollection[];
  ownedCount?: number;
  identifiedCount?: number;
  wishlistedCount?: number;
};

export const OWNED_COLLECTION_ID = "system:owned";
export const IDENTIFIED_COLLECTION_ID = "system:identified";

export type UserCollectionOption = {
  id: string;
  label: string;
  kind: "identified" | "owned" | "private";
  /** When set, sent as `_collection` on `POST /coin/add`. */
  collectionId?: string;
  isOwned: boolean;
  isIdentified: boolean;
  isWishlisted: boolean;
};

function isDefaultIdentifiedBucket(c: ApiPrivateCollection): boolean {
  return c.name === "Identified" && (c.description ?? "").toLowerCase().includes("auto created");
}

/** System identified / owned rows plus private collections from the API. */
export function buildCollectionOptions(api: CollectionsFetchPayload): UserCollectionOption[] {
  const identifiedBucket = api.data.find(isDefaultIdentifiedBucket);

  const options: UserCollectionOption[] = [
    {
      id: IDENTIFIED_COLLECTION_ID,
      label: "Identified collection",
      kind: "identified",
      collectionId: identifiedBucket?.collectionId,
      isOwned: false,
      isIdentified: true,
      isWishlisted: false,
    },
    {
      id: OWNED_COLLECTION_ID,
      label: "Owned collection",
      kind: "owned",
      isOwned: true,
      isIdentified: true,
      isWishlisted: false,
    },
  ];

  for (const c of api.data) {
    if (isDefaultIdentifiedBucket(c)) continue;
    options.push({
      id: `private:${c.collectionId}`,
      label: c.name,
      kind: "private",
      collectionId: c.collectionId,
      isOwned: false,
      isIdentified: true,
      isWishlisted: false,
    });
  }

  return options;
}

export function privateCollectionOption(row: ApiPrivateCollection): UserCollectionOption {
  return {
    id: `private:${row.collectionId}`,
    label: row.name,
    kind: "private",
    collectionId: row.collectionId,
    isOwned: false,
    isIdentified: true,
    isWishlisted: false,
  };
}

export function defaultNewCollectionName(privateCount: number): string {
  return `Private collection #${privateCount + 1}`;
}

export function collectionLabel(options: UserCollectionOption[], selectedId: string): string {
  return options.find((o) => o.id === selectedId)?.label ?? "your collection";
}

export function applyCollectionToAddBody(
  base: AddCoinRequestBody,
  option: UserCollectionOption,
  userOwnsCoin: boolean,
): AddCoinRequestBody {
  const body = { ...base };
  if (option.kind === "owned") {
    body.isOwned = true;
    body.isWishlisted = false;
  } else if (option.kind === "identified") {
    body.isOwned = false;
    body.isWishlisted = false;
  } else {
    body.isOwned = userOwnsCoin;
    body.isWishlisted = false;
    if (option.collectionId) body._collection = option.collectionId;
  }
  if (option.collectionId && option.kind === "identified") {
    body._collection = option.collectionId;
  }
  // Identify flow: every saved coin is marked identified regardless of target collection.
  body.isIdentified = true;
  return body;
}
