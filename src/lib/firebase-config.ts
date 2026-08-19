export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDmKrwi0T9Rn8YJJYiPYuMGsoH8ga-RJMU',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'certificate-generator-16580.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'certificate-generator-16580',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'certificate-generator-16580.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '89629941945',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:89629941945:web:13f508f2d2a0d92cf63b68',
};
