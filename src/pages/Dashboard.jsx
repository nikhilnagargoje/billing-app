import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      if (!auth.currentUser) return;

      const data = await getDocs(
        collection(db, "users", auth.currentUser.uid, "bills")
      );

      setBills(data.docs.map((doc) => doc.data()));
    };

    fetchBills();
  }, []);

  const total = bills.reduce((s, b) => s + (b.total || 0), 0);
  const paid = bills.reduce((s, b) => s + (b.paidAmount || 0), 0);
  const remaining = bills.reduce((s, b) => s + (b.remainingAmount || 0), 0);

  const today = new Date().toLocaleDateString();

  const dailyProfit = bills
    .filter(
      (b) =>
        b.createdAt &&
        new Date(b.createdAt.seconds * 1000).toLocaleDateString() === today
    )
    .reduce((s, b) => s + (b.profit || 0), 0);

  const monthlyProfit = bills.reduce((s, b) => s + (b.profit || 0), 0);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-box">
          <h4>Total Revenue</h4>
          <p className="animate-value">₹{total}</p>
        </div>

        <div className="stat-box">
          <h4>Received</h4>
          <p className="animate-value">₹{paid}</p>
        </div>

        <div className="stat-box pending">
          <h4>Pending</h4>
          <p className="animate-value">₹{remaining}</p>
        </div>

        <div className="stat-box">
          <h4>Daily Profit</h4>
          <p className="animate-value">₹{dailyProfit}</p>
        </div>

        <div className="stat-box">
          <h4>Monthly Profit</h4>
          <p className="animate-value">₹{monthlyProfit}</p>
        </div>
      </div>

      <div className="actions">
        <button onClick={() => navigate("/products")}>📦 Products</button>
        <button onClick={() => navigate("/stock")}>📦 Stock</button>
        <button onClick={() => navigate("/billing")}>🧾 Billing</button>
        <button onClick={() => navigate("/customers")}>👥 Customers</button>
        <button onClick={() => navigate("/bills")}>📄 Bills</button>
        <button onClick={() => navigate("/analytics")}>📊 Analytics</button>
        <button onClick={() => navigate("/profile")}>⚙️ Profile</button>
      </div>
    </div>
  );
}