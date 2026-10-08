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
