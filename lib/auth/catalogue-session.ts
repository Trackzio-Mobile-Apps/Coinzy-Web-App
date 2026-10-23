import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAboutMe, type AboutMeUser } from "@/lib/api/auth-session";

/**
 * Server-only: require a catalogue `auth/me` user for the current API origin.
 * Stale JWTs (e.g. QA login + prod `COINZY_API_ORIGIN`) redirect via route handler that clears the cookie.
 */
export async function requireCatalogueSession(nextPath: string): Promise<{
  token: string;
  user: AboutMeUser;
}> {
  const token = (await cookies()).get("coinzy_session")?.value;
  if (!token) redirect(`/auth?next=${encodeURIComponent(nextPath)}`);

  const about = await fetchAboutMe(token);
  if (!about.error) {
    return { token, user: about.user };
  }

  if (about._status === 401 || about._status === 404) {
    const next = encodeURIComponent(nextPath);
    redirect(`/api/auth/clear-session?next=${next}`);
  }

  redirect(`/auth?next=${encodeURIComponent(nextPath)}`);
}
