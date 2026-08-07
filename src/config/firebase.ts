import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyAGUfqFnP1R__rX4wiWfYMLF-z74rG3ucQ",
  authDomain: "typing-euro.firebaseapp.com",
  databaseURL: "https://typing-euro-default-rtdb.firebaseio.com",
  projectId: "typing-euro",
  storageBucket: "typing-euro.firebasestorage.app",
  messagingSenderId: "595263740564",
  appId: "1:595263740564:web:224a293689db4fe679f281",
  measurementId: "G-Y0X828SHR9"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
