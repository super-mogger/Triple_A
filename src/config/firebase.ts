import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDZoPblnyNbs4Xqo1pwISpKh70Q2gvMYQY',
  authDomain: 'triple-a-b8605.firebaseapp.com',
  projectId: 'triple-a-b8605',
  storageBucket: 'triple-a-b8605.appspot.com',
  messagingSenderId: '182821274121',
  appId: '1:182821274121:android:db24eb55d34ad6135f2ed8',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
