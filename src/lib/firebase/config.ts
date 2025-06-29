
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// In a real app, you would also initialize Firestore and Storage here
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

// This check prevents the app from crashing on the server if the environment
// variables are not set. It's crucial for the Next.js build process.
if (firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase. Please check your credentials.", error);
    // If initialization fails, we set auth to undefined so the app can still run.
    app = undefined;
    auth = undefined;
  }
} else {
    // If the keys are not present, we log a warning.
    // Auth features will not work, but the app will not crash.
    console.warn("Firebase config not found. Auth features will be disabled.")
}

// const db = app ? getFirestore(app) : undefined;
// const storage = app ? getStorage(app) : undefined;

export { app, auth };
