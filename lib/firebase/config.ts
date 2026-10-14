/**
 * Firebase web config — mirrors Android projects:
 * - Current debug / staging deploys → `coinzy-dev` (defaults below)
 * - Real prod later → `coinzy-26a4d` via `NEXT_PUBLIC_FIREBASE_*`
 *
 * Defaults are the official web app for `coinzy-dev` (Console → Project settings).
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

/** Resolve config: env override → else coinzy-dev (ok for debug server deploys). */
export function getFirebaseWebConfig(): FirebaseWebConfig {
  return fromEnv() ?? DEV_CONFIG;
}
