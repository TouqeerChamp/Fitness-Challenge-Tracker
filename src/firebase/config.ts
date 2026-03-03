import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Safe environment variable access with fallback values
// This ensures values are never undefined and provides clear error messages
const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
  }
  return value || '';
};

// Firebase project configuration from environment variables
// Get these values from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

// Validate required configuration
const requiredVars = ['apiKey', 'projectId'];
const missingVars = requiredVars.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
if (missingVars.length > 0) {
  console.error('Firebase configuration missing required values:', missingVars);
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

export default app;