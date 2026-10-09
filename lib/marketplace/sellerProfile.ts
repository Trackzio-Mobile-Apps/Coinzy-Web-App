import type { SellerDetails } from "@/lib/api/auth-session";

export type SellerProfileFormState = {
  name: string;
  personalEmail: string;
  usePersonalEmail: boolean;
  sellerEmail: string;
  phoneNumber: string;
  bio: string;
  /** Kept for sell payloads; not shown on Figma Set Profile. */
  location: string;
};

export type SellerProfileFormErrors = Partial<Record<"name" | "sellerEmail" | "form", string>>;

/** Seller profile is ready to list when name + contact email are present. */
export function isSellerProfileComplete(details: SellerDetails | null | undefined): boolean {
  const name = details?.name?.trim() ?? "";
  const email = details?.contactEmail?.trim() ?? "";
  return Boolean(name && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export function sellerDetailsFromForm(values: SellerProfileFormState): SellerDetails {
  const contactEmail = (values.usePersonalEmail ? values.personalEmail : values.sellerEmail).trim();
  return {
    name: values.name.trim(),
    contactEmail,
    location: values.location.trim() || "—",
    phoneNumber: values.phoneNumber.trim() || undefined,
    bio: values.bio.trim() || undefined,
    externalLinks: [],
  };
}

export function validateSellerProfileForm(values: SellerProfileFormState): SellerProfileFormErrors {
  const errors: SellerProfileFormErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name";
  const email = (values.usePersonalEmail ? values.personalEmail : values.sellerEmail).trim();
  if (!email) errors.sellerEmail = "Enter seller email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.sellerEmail = "Enter a valid email";
  else if (values.usePersonalEmail && !values.personalEmail.trim()) {
    errors.sellerEmail = "Personal email is missing — enter a seller email instead";
  }
  return errors;
}

export function formStateFromSellerDetails(
  details: SellerDetails | null | undefined,
  personalEmail: string,
  defaultName = "",
): SellerProfileFormState {
  const contact = details?.contactEmail?.trim() ?? "";
  const personal = personalEmail.trim();
  const usePersonal = Boolean(personal && contact && contact.toLowerCase() === personal.toLowerCase());
  return {
    name: details?.name?.trim() || defaultName,
    personalEmail: personal,
    usePersonalEmail: usePersonal,
    sellerEmail: usePersonal ? "" : contact,
    phoneNumber: details?.phoneNumber?.trim() ?? "",
    bio: details?.bio?.trim() ?? "",
    location: details?.location?.trim() && details.location !== "—" ? details.location.trim() : "",
  };
}
