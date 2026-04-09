import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [allBills, setAllBills] = useState([]); // ✅ backup
  const userId = auth.currentUser?.uid;

  const fetchBills = async () => {
    if (!userId) return;

    const data = await getDocs(
      collection(db, "users", userId, "bills")
    );

    const billsData = data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setBills(billsData);
    setAllBills(billsData); // ✅ store original
  };

  // 🔍 Search Fix
  const handleBillSearch = (text) => {
    if (!text) {
      setBills(allBills);
      return;
    }

    const filtered = allBills.filter((b) =>
      b.billNo?.toLowerCase().includes(text.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(text.toLowerCase())
    );

    setBills(filtered);
  };

  useEffect(() => {
    fetchBills();
  }, [userId]);

  // ✅ Totals should be from allBills (not filtered)
  const totalAmount = allBills.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalPaid = allBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalRemaining = allBills.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

  return (
    <div className="container">
      <h2>All Bills</h2>

      {/* ✅ Search outside loop */}
      <input
        placeholder="Search Bill / Customer"
        onChange={(e) => handleBillSearch(e.target.value)}
        style={{ marginBottom: "15px" }}
      />

      {/* ✅ Total Business outside loop */}
      <h3>Total Business</h3>
      <p><b>Total Sale:</b> ₹{totalAmount}</p>
      <p><b>Total Received:</b> ₹{totalPaid}</p>
      <p><b>Total Pending:</b> ₹{totalRemaining}</p>

      <hr />

      {bills.map((bill) => (
        <div
          key={bill.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p><b>Bill No:</b> {bill.billNo}</p>

          <p>
            <b>Date:</b>{" "}
            {bill.createdAt?.seconds
              ? new Date(bill.createdAt.seconds * 1000).toLocaleDateString()
              : "-"}
          </p>

          <p><b>Customer:</b> {bill.customerName}</p>
          <p><b>Phone:</b> {bill.customerPhone}</p>

          <p><b>Total:</b> ₹{bill.total}</p>
          <p><b>Paid:</b> ₹{bill.paidAmount || 0}</p>
          <p><b>Remaining:</b> ₹{bill.remainingAmount || 0}</p>
          <p><b>Payment Mode:</b> {bill.paymentMode || "-"}</p>
        </div>
      ))}
    </div>
  );
}