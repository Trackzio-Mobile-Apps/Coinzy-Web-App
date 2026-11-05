/** Keep every sale-form choice even when marketplace filters contain only a subset. */
export function mergeSaleOptions(defaults: string[], existing: string[] = []): string[] {
  const seen = new Set<string>();
  return [...defaults, ...existing].map((value) => value.trim()).filter((value) => {
    const key = value.toLocaleLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type SellFormState = {
  price: string;
  contactEmail: string;
  externalLinks: string[];
  linkDraft: string;
  gradingScale: string;
  gradeValue: string;
  gradingAuthority: string;
  certificationNumber: string;
  strikerType: string;
  cleaningAlterations: string;
  coinCondition: string;
};

export type SellFormErrors = Partial<Record<keyof SellFormState | "form", string>>;

export function validateSellForm(values: SellFormState): SellFormErrors {
  const errors: SellFormErrors = {};
  const price = Number.parseFloat(values.price.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(price) || price <= 0) errors.price = "Price is required";
  if (!values.contactEmail.trim()) errors.contactEmail = "Please enter your contact ID";
  if (!values.gradingScale.trim()) errors.gradingScale = "This field is required";
  if (!values.gradingAuthority.trim()) errors.gradingAuthority = "This field is required";
  return errors;
}

export function buildSellPayload(
  values: SellFormState,
  seller: { name: string; email: string },
  coinTitle: string,
) {
  const price = Number.parseFloat(values.price.replace(/[^0-9.]/g, ""));
  const links = [...values.externalLinks];
  const draft = values.linkDraft.trim();
  if (draft) links.push(draft);
  return {
    title: coinTitle,
    price,
    gradingScale: values.gradingScale || undefined,
    gradeValue: values.gradeValue || undefined,
    gradingAuthority: values.gradingAuthority || undefined,
    certificationNumber: values.certificationNumber.trim() || undefined,
    strikerType: values.strikerType || undefined,
    cleaningAlterations: values.cleaningAlterations ? [values.cleaningAlterations] : undefined,
    coinCondition: values.coinCondition.trim() || undefined,
    sellerDetails: {
      name: seller.name,
      contactEmail: values.contactEmail.trim(),
      location: "—",
      externalLinks: links.filter(Boolean),
    },
  };
}

/** Only send edited fields so existing listing and seller metadata remain intact. */
export function buildListingUpdate(payload: ReturnType<typeof buildSellPayload>, listing: import("@/lib/api/coinzy").ListingDetails): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  if (payload.price !== Number(listing.price)) changes.price = payload.price;
  const fields = ["gradingScale", "gradeValue", "gradingAuthority", "certificationNumber", "strikerType", "coinCondition"] as const;
  for (const field of fields) {
    const next = payload[field] ?? "";
    if (next !== (listing[field] ?? "")) changes[field] = next;
  }
  const cleaning = payload.cleaningAlterations ?? [];
  if ((cleaning[0] ?? "") !== (listing.cleaningAlterations?.[0] ?? "")) changes.cleaningAlterations = cleaning;
  const links = listing.sellerDetails?.externalLinks ?? [];
  if (payload.sellerDetails.contactEmail !== (listing.sellerDetails?.contactEmail ?? "") || JSON.stringify(payload.sellerDetails.externalLinks) !== JSON.stringify(links)) {
    changes.sellerDetails = { ...listing.sellerDetails, contactEmail: payload.sellerDetails.contactEmail, externalLinks: payload.sellerDetails.externalLinks };
  }
  return changes;
}
