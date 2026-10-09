"use client";

/**
 * Google sign-in for web (Android Credential Manager parity).
 *
 * 1. Firebase Google popup → Google ID token (`credential.idToken`)
 * 2. Caller POSTs that token to `/api/auth/google` → Coinzy `auth/social-login/google`
 * 3. After Coinzy session cookie is set, `ensureFirebaseSession` re-links Feed Auth
 *    with email/password (password === email), same as Android `AuthViewModel.googleLogin`.
 */

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export type GoogleIdCredential = {
  /** Google ID token — Coinzy `GLogin.credential`, not the Coinzy session JWT. */
  credential: string;
  fullName: string;
  email: string;
};

export async function obtainGoogleIdCredential(): Promise<GoogleIdCredential> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const oauth = GoogleAuthProvider.credentialFromResult(result);
  const idToken = oauth?.idToken;
  if (!idToken) {
    await signOut(auth).catch(() => undefined);
    throw new Error("Google did not return an ID token. Please try again.");
  }

  const fullName = (result.user.displayName || "").trim();
  const email = (result.user.email || "").trim();

  // Coinzy session + Feed bridge own Firebase Auth next (email/password), matching Android.
  await signOut(auth).catch(() => undefined);

  return { credential: idToken, fullName, email };
}

export function googleAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Google sign-in failed. Please try again.";
  const code =
    typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Google sign-in was cancelled.";
  }
  if (code === "auth/popup-blocked") {
    return "Pop-up blocked. Allow pop-ups for this site and try again.";
  }
  if (code === "auth/unauthorized-domain") {
    return "This domain is not authorized for Google sign-in yet.";
  }
  return error.message || "Google sign-in failed. Please try again.";
}
