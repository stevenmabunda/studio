
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './clientConfig';

// This function ensures Firebase is initialized, either by creating a new app
// or getting the existing one. This is safe to run on both client and server.
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db: Firestore = getFirestore(app, "bholo");
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
