import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCRDK2r-JKC4L29UlRE-1h1GlbDAGD3j8",
  authDomain: "quickutil-d2998.firebaseapp.com",
  projectId: "quickutil-d2998",
  storageBucket: "quickutil-d2998.firebasestorage.app",
  messagingSenderId: "768751015182",
  appId: "1:768751015182:web:ef3472a90fccf57a72335f"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export { app }; 