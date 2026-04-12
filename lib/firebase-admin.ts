import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App;

if (getApps().length === 0) {
  // Vercel / local: use GOOGLE_APPLICATION_CREDENTIALS or service account env var
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    app = initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    });
  } else {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS env var or default credentials
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    app = getApps()[0];
  }
} else {
  app = getApps()[0];
}

export const adminDb: Firestore = getFirestore(app);
