import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Read Firebase config from environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBMHtGHzvOuzfqeObd9mshPai54dXiLrQI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "triplea-7794b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "triplea-7794b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "triplea-7794b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "642891546241",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:642891546241:web:dd470cc6bf350cdc38d780",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-STYM2FF68V"
};

// Log which Firebase project we're connecting to (helpful for debugging)
console.log(`Connecting to Firebase project: ${firebaseConfig.projectId}`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
