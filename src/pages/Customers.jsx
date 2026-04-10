import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/customers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]); // ✅ backup

 const [userId, setUserId] = useState(null);
 useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      setUserId(null);
    }
  });

  return () => unsubscribe();
}, []);


  const fetchCustomers = async () => {
    if (!userId) return;

    const data = await getDocs(
      collection(db, "users", userId, "customers")
    );

    const customersData = data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCustomers(customersData);
    setAllCustomers(customersData); // ✅ store original
  };

  // 🔍 Search Fix
  const handleSearch = (text) => {
    if (!text) {
      setCustomers(allCustomers);
      return;
    }

    const filtered = allCustomers.filter((c) =>
      c.customerId?.toLowerCase().includes(text.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(text.toLowerCase()) ||
      c.customerPhone?.includes(text)
    );

    setCustomers(filtered);
  };

  useEffect(() => {
  if (userId) {
    fetchCustomers();
  }
}, [userId]);

  return (
    <div className="container">
      <h2>Customers</h2>

      {/* 🔍 Search */}
      <input
        placeholder="Search Customer (ID / Name / Phone)"
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: "15px" }}
      />

      {customers.length === 0 && <p>No Customers Found</p>}

      {customers.map((c, i) => (
  <div key={c.id || i} className="customer-card">
    <p><b>ID:</b> {c.customerId || "-"}</p>
    <p className="customer-name"><b>Name:</b> {c.customerName || "-"}</p>
    <p><b>Phone:</b> {c.customerPhone || "-"}</p>
   <p>
  <b>Remaining:</b>{" "}
  <span className={c.remainingAmount > 0 ? "remaining-high" : ""}>
    ₹{c.remainingAmount || 0}
  </span>
</p>
    <hr />
  </div>
))}
    </div>
  );
}