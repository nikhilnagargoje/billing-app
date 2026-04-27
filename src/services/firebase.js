// 🔥 Firebase Core
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Config
const firebaseConfig = {
   apiKey: "AIzaSyAl64FfinuYRcLkqEqaqtCqHZtnf1P9FqI",
  authDomain: "billing-app-3f902.firebaseapp.com",
  projectId: "billing-app-3f902",
  storageBucket: "billing-app-3f902.firebasestorage.app",
  messagingSenderId: "1076771615934",
  appId: "1:1076771615934:web:d059ecec41c21477ff1aef",
};

// 🚀 Initialize
const app = initializeApp(firebaseConfig);

// ✅ Exports
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


// =====================================================
// 🤖 CHATBOT FUNCTIONS (SMART DATA)
// =====================================================

// 📅 Helper: आजचा date range (00:00 ते 23:59)
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};


// 📊 1. Today Sales Count (OPTIMIZED 🔥)
export const getTodaySalesCount = async () => {
  try {
    const { start, end } = getTodayRange();

    const q = query(
      collection(db, "sales"),
      where("createdAt", ">=", start),
      where("createdAt", "<=", end)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;

  } catch (error) {
    console.error("Error fetching sales count:", error);
    return 0;
  }
};


// 💰 2. Today Revenue
export const getTodayRevenue = async () => {
  try {
    const { start, end } = getTodayRange();

    const q = query(
      collection(db, "sales"),
      where("createdAt", ">=", start),
      where("createdAt", "<=", end)
    );

    const snapshot = await getDocs(q);

    let total = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      total += data.totalAmount || 0;
    });

    return total;

  } catch (error) {
    console.error("Error fetching revenue:", error);
    return 0;
  }
};


// ⏳ 3. Pending Payments
export const getPendingPaymentsCount = async () => {
  try {
    const q = query(
      collection(db, "sales"),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);
    return snapshot.size;

  } catch (error) {
    console.error("Error fetching pending:", error);
    return 0;
  }
};


// 📦 4. Low Stock Products
export const getLowStockProducts = async () => {
  try {
    const q = query(
      collection(db, "products"),
      where("stock", "<=", 5) // threshold
    );

    const snapshot = await getDocs(q);

    const items = [];
    snapshot.forEach(doc => {
      items.push(doc.data().name);
    });

    return items;

  } catch (error) {
    console.error("Error fetching low stock:", error);
    return [];
  }
};