import type { FirebaseOptions } from 'firebase/app';

// =================================================================================
// IMPORTANT!
//
// Replace the placeholder values below with your actual Firebase project credentials.
// You can find these in your Firebase project settings:
//
// 1. Go to the Firebase console: https://console.firebase.google.com/
// 2. Select your project.
// 3. Click the gear icon (Project settings) in the sidebar.
// 4. In the "General" tab, scroll down to "Your apps".
// 5. Select your web app and find the "SDK setup and configuration" section.
// 6. Choose "Config" to view your credentials.
// 7. Copy the corresponding values and paste them here.
// =================================================================================

export const firebaseConfig: FirebaseOptions = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'YOUR_AUTH_DOMAIN_HERE',
  projectId: 'YOUR_PROJECT_ID_HERE',
  storageBucket: 'YOUR_STORAGE_BUCKET_HERE',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID_HERE',
  appId: 'YOUR_APP_ID_HERE',
};
