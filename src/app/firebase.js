import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const cleanEnvVar = (val) => {
  if (typeof val !== "string") return val;
  return val.replace(/^["']|["']$/g, "");
};

const firebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

const hasValidKey = firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIzaSy");

let app;
let auth;
let db;

if (hasValidKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Use a fallback config during build/SSR so page generation doesn't crash.
  // This allows the Next.js build to succeed even if Firebase env variables 
  // are missing or invalid in the build environment.
  if (typeof window !== "undefined") {
    console.warn(
      "⚠️ Krishi Sakhi Warning: NEXT_PUBLIC_FIREBASE_API_KEY is missing or invalid. " +
      "Falling back to dummy Firebase configuration. Ensure your .env.local file is loaded."
    );
  }
  const fallbackConfig = {
    apiKey: "AIzaSyDummyKeyForBuildPrerenderingOnly",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:dummy"
  };
  app = getApps().length === 0 ? initializeApp(fallbackConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };