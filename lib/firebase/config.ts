/**
 * Firebase web config — mirrors Android projects:
 * - Dev / local → `coinzy-dev`
 * - Production → `coinzy-26a4d` (set `NEXT_PUBLIC_FIREBASE_*` in prod env)
 *
 * Defaults below are the official web app for `coinzy-dev` (Console → Project settings).
 */

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const DEV_CONFIG: FirebaseWebConfig = {
  apiKey: "AIzaSyBqPVKoGuEl55qm0wagIxKEUTWBzBhhL44",
  authDomain: "coinzy-dev.firebaseapp.com",
  projectId: "coinzy-dev",
  storageBucket: "coinzy-dev.firebasestorage.app",
  messagingSenderId: "658935682252",
  appId: "1:658935682252:web:03f3defa38b2306e741e69",
  measurementId: "G-NSL6S0JE4X",
};

function fromEnv(): FirebaseWebConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined;
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId };
}

/** Resolve config: env override (prod) → else coinzy-dev defaults for local/dev. */
export function getFirebaseWebConfig(): FirebaseWebConfig {
  const env = fromEnv();
  if (env) return env;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Firebase web config missing. Set NEXT_PUBLIC_FIREBASE_* for the coinzy-26a4d web app.",
    );
  }
  return DEV_CONFIG;
}
