import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAl64FfinuYRcLkqEqaqtCqHZtnf1P9FqI",
  authDomain: "billing-app-3f902.firebaseapp.com",
  projectId: "billing-app-3f902",
  storageBucket: "billing-app-3f902.firebasestorage.app",
  messagingSenderId: "1076771615934",
  appId: "1:1076771615934:web:d059ecec41c21477ff1aef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ REQUIRED EXPORTS
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);