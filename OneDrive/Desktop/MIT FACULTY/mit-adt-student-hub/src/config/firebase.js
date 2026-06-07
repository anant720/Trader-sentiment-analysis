// ─────────────────────────────────────────────────────────
// Firebase Initialization
// App Check is initialized here before any Firestore reads.
// ─────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import env from './env';

const firebaseConfig = {
  apiKey:            env.firebaseApiKey,
  authDomain:        env.firebaseAuthDomain,
  projectId:         env.firebaseProjectId,
  storageBucket:     env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId:             env.firebaseAppId,
  measurementId:     env.firebaseMeasurementId,
};

// Initialize Firebase only if API key is present
let app;
let auth;
let db;
let storage;

import { initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';

try {
  app = initializeApp(firebaseConfig);
  
  // Explicitly initialize with indexedDBLocalPersistence to avoid browser persistence blocking in Android WebViews
  auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
  });

  // Initialize Firestore with modern persistence (migrating from deprecated enableIndexedDbPersistence)
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

  storage = getStorage(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw error; // Hard-stop in production
}

export { auth, db, storage };
export default app;
