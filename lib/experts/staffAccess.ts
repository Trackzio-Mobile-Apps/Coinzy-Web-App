/** Company staff may use web dummy credit purchase until real payments ship. */
export function isTrackzioStaffEmail(email: string | null | undefined): boolean {
  const normalized = (email || "").trim().toLowerCase();
  return normalized.endsWith("@trackzio.com");
}
