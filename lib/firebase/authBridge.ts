"use client";

/**
 * Mirror Android Firebase Auth linking (AuthViewModel / BaseApp):
 * - Signed-in Coinzy user → email/password where password === email
 * - Guest → anonymous
 * Coinzy JWT stays in HTTP-only cookies; Firebase Auth is only for Firestore/Storage rules.
 */

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export type FeedIdentity = {
  /** Coinzy user / guest id stored on posts (`user.userId`). */
  userId: string;
  name: string;
  email: string;
  isGuest: boolean;
  profilePictureUrl?: string | null;
};

let bridgePromise: Promise<User | null> | null = null;

function waitForAuthUser(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

/** Sign into Firebase the same way Android does after Coinzy login/signup/guest. */
export async function ensureFirebaseSession(identity: {
  email: string;
  isGuest: boolean;
}): Promise<User | null> {
  if (typeof window === "undefined") return null;

  if (!bridgePromise) {
    bridgePromise = (async () => {
      const auth = getFirebaseAuth();
      const existing = await waitForAuthUser();

      if (identity.isGuest || !identity.email.trim()) {
        if (existing?.isAnonymous) return existing;
        if (existing && !existing.isAnonymous) await signOut(auth);
        const cred = await signInAnonymously(auth);
        return cred.user;
      }

      const email = identity.email.trim();
      const password = email; // Android: password === email

      if (existing && !existing.isAnonymous && existing.email?.toLowerCase() === email.toLowerCase()) {
        return existing;
      }
      if (existing) await signOut(auth);

      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
      } catch (err: unknown) {
        const code = typeof err === "object" && err && "code" in err ? String((err as { code: string }).code) : "";
        if (code === "auth/user-not-found" || code === "auth/invalid-credential" || code === "auth/wrong-password") {
          try {
            const created = await createUserWithEmailAndPassword(auth, email, password);
            return created.user;
          } catch (createErr: unknown) {
            const createCode =
              typeof createErr === "object" && createErr && "code" in createErr
                ? String((createErr as { code: string }).code)
                : "";
            // Race: account created elsewhere between sign-in and create
            if (createCode === "auth/email-already-in-use") {
              const cred = await signInWithEmailAndPassword(auth, email, password);
              return cred.user;
            }
            throw createErr;
          }
        }
        throw err;
      }
    })().finally(() => {
      bridgePromise = null;
    });
  }

  return bridgePromise;
}

export async function signOutFirebase(): Promise<void> {
  if (typeof window === "undefined") return;
  const auth = getFirebaseAuth();
  if (auth.currentUser) await signOut(auth);
}
