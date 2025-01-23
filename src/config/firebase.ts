import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB4JkzPJ6D0usSs-Q-xLYt2DqNoqblfZ8Y",
  authDomain: "triple-a-b8605.firebaseapp.com",
  projectId: "triple-a-b8605",
  storageBucket: "triple-a-b8605.firebasestorage.app",
  messagingSenderId: "182821274121",
  appId: "1:182821274121:web:bb3ec74d399a7ca05f2ed8",
  measurementId: "G-P317SYYJZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
