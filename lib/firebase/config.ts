/**
 * Firebase web config — Android release project `coinzy-26a4d`.
 *
 * The web API key is a public client key (enforced by Firebase Auth domains
 * and Security Rules). It has to be in the browser bundle, so the default
 * below is what Netlify builds when `NEXT_PUBLIC_FIREBASE_API_KEY` was never
 * set in the UI. A complete `NEXT_PUBLIC_FIREBASE_*` set still overrides it.
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

/** Official web app for `coinzy-26a4d` (Console → Project settings). */
const PROD_WEB_CONFIG: FirebaseWebConfig = {
  apiKey: "AIzaSyDp5u7EgrZ1NmJs7sBQaBoyG_KdOiA47fg",
  authDomain: "coinzy-26a4d.firebaseapp.com",
  projectId: "coinzy-26a4d",
  storageBucket: "coinzy-26a4d.firebasestorage.app",
  messagingSenderId: "1005300770086",
  appId: "1:1005300770086:web:bc49173769b3460ad9cde7",
  measurementId: "G-6474GBCE3W",
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

/** Full env override, otherwise the `coinzy-26a4d` web app. */
export function getFirebaseWebConfig(): FirebaseWebConfig {
  return fromEnv() ?? PROD_WEB_CONFIG;
}
