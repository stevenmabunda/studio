
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './clientConfig';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
    if (getApps().length) {
        app = getApp();
    } else {
        app = initializeApp(firebaseConfig);
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

} catch (error) {
    console.error("Firebase initialization error", error);
    // You might want to throw the error or handle it in a way that
    // the application knows that Firebase services are not available.
}

export { app, auth, db, storage };
