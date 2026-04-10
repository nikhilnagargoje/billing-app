import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import "../styles/bills.css";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState(null);

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setUserId(user.uid);
    }
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (userId) {
    fetchBills();
  }
}, [userId]);

  const fetchBills = async () => {
    if (!userId) return;
    const q = query(
      collection(db, "users", userId, "bills"),
      orderBy("createdAt", "desc")
    );
    const data = await getDocs(q);
    const billsData = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setBills(billsData);
    setAllBills(billsData);
  };

  // Search
  useEffect(() => {
    if (!search) return setBills(allBills);
    const filtered = allBills.filter((b) =>
      b.billNo?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone?.includes(search)
    );
    setBills(filtered);
  }, [search, allBills]);

  const totalAmount = allBills.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalPaid = allBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalRemaining = allBills.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

  return (
    <div className="bills-container">
      <h2>All Bills</h2>

      <input
        placeholder="Search Bill / Customer / Phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      <div className="summary-cards">
        <div className="summary-card">
          <p>Total Sale</p>
          <h3 className={totalAmount >= 0 ? "amount-positive" : "amount-negative"}>
            ₹{totalAmount.toFixed(2)}
          </h3>
        </div>
        <div className="summary-card">
          <p>Total Received</p>
          <h3 className={totalPaid >= 0 ? "amount-positive" : "amount-negative"}>
            ₹{totalPaid.toFixed(2)}
          </h3>
        </div>
        <div className="summary-card">
          <p>Total Pending</p>
          <h3 className={totalRemaining > 0 ? "amount-negative" : "amount-positive"}>
            ₹{totalRemaining.toFixed(2)}
          </h3>
        </div>
      </div>

      {bills.length === 0 && <p className="no-bills">No Bills Found</p>}

      {bills.map((bill) => (
        <div key={bill.id} className="bill-card">
          <div className="bill-header">
            <p><b>Bill No:</b> {bill.billNo}</p>
            <p><b>Date:</b> {bill.createdAt?.seconds ? new Date(bill.createdAt.seconds * 1000).toLocaleDateString() : "-"}</p>
          </div>
          <div className="bill-body">
            <p><b>Customer:</b> {bill.customerName || "Walk-in"}</p>
            <p><b>Phone:</b> {bill.customerPhone || "-"}</p>
            <p><b>Total:</b> <span className={bill.total >= 0 ? "amount-positive" : "amount-negative"}>₹{bill.total}</span></p>
            <p><b>Paid:</b> <span className={bill.paidAmount >= 0 ? "amount-positive" : "amount-negative"}>₹{bill.paidAmount || 0}</span></p>
            <p><b>Remaining:</b> <span className={bill.remainingAmount > 0 ? "amount-negative" : "amount-positive"}>₹{bill.remainingAmount || 0}</span></p>
            <p><b>Payment Mode:</b> {bill.paymentMode || "-"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}