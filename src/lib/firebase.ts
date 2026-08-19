import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase-config';

const app = getApps()[0] || initializeApp(firebaseConfig);

function getDb() {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache(),
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = getDb();

export default app;
