import { useState, useEffect, useRef } from "react";
import "../styles/billing.css";
import { db, auth } from "../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useReactToPrint } from "react-to-print";
import Invoice from "./Invoice";

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState([]);

  const [paymentMode, setPaymentMode] = useState("");
  const [extraDiscount, setExtraDiscount] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const [billNo, setBillNo] = useState("");
  const [profile, setProfile] = useState(null);

  // ✅ Extras
  const [extras, setExtras] = useState([]);
  const [extraName, setExtraName] = useState("");
  const [extraAmount, setExtraAmount] = useState("");

  const invoiceRef = useRef();
 const [userId, setUserId] = useState(null);

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setUserId(user.uid);
    }
  });

  return () => unsubscribe();
}, []);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    
  });

  const handleDownloadAndWhatsApp = () => {
  if (!customerPhone) return alert("Enter customer phone");

  const phone = customerPhone.replace(/\D/g, "");

  const message = `Hello ${customerName || ""}, your bill is ready.
Total: ₹${getTotal().toFixed(2)}
Please find attached invoice.`;

  const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

  // 👉 1. FIRST WhatsApp open करा (important)
  window.open(url, "_blank");

  // 👉 2. मग print (PDF) open करा delay नंतर
  setTimeout(() => {
    handlePrint();
  }, 800); // delay must
};

  // 🔥 Bill No
  useEffect(() => {
    setBillNo("BILL-" + Math.floor(100000 + Math.random() * 900000));
  }, []);

  // 🔥 Fetch Data
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const prod = await getDocs(collection(db, "users", userId, "products"));
      setProducts(prod.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const ref = doc(db, "users", userId, "profile", "data");
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };

    fetchData();
  }, [userId]);

  // ➕ Add Item
  const addItem = () => {
    if (!selectedProduct) return alert("Select product");

    const p = selectedProduct;

    if (p.type === "product" && (p.stock || 0) < qty) {
      return alert("Out of stock ❌");
    }

    let price = Number(p.price) || 0;
    price = price - (price * (Number(p.discount) || 0)) / 100;
    price = price + (price * (Number(p.gst) || 0)) / 100;

    const finalPrice = price * qty;
    const profit =
      ((Number(p.price) || 0) - (Number(p.purchasePrice) || 0)) * qty;

    setItems([
      ...items,
      {
        id: p.id || "",
        name: p.name || "",
        price: Number(p.price) || 0,
        purchasePrice: Number(p.purchasePrice) || 0,
        discount: Number(p.discount) || 0,
        gst: Number(p.gst) || 0,
        qty: Number(qty) || 1,
        total: Number(finalPrice) || 0,
        profit: Number(profit) || 0,
        type: p.type || "product",
      },
    ]);

    setQty(1);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateQty = (index, newQty) => {
    const updated = [...items];
    let item = updated[index];

    let price = item.price;
    price = price - (price * (item.discount || 0)) / 100;
    price = price + (price * (item.gst || 0)) / 100;

    item.qty = newQty;
    item.total = price * newQty;
    item.profit =
      (item.price - (item.purchasePrice || 0)) * newQty;

    setItems(updated);
  };

  // 🔥 Calculations
  const getSubtotal = () =>
    items.reduce((s, i) => s + i.price * i.qty, 0);

  const getProductDiscount = () =>
    items.reduce(
      (s, i) => s + (i.price * i.qty * (i.discount || 0)) / 100,
      0
    );

  const getGST = () =>
    items.reduce((s, i) => {
      let price = i.price - (i.price * (i.discount || 0)) / 100;
      return s + (price * i.qty * (i.gst || 0)) / 100;
    }, 0);

  const getExtraTotal = () =>
    extras.reduce((s, e) => s + e.amount, 0);

  const getTotal = () => {
    return (
      getSubtotal() -
      getProductDiscount() +
      getGST() -
      Number(extraDiscount || 0) +
      getExtraTotal()
    );
  };

  const getProfit = () =>
    items.reduce((s, i) => s + (i.profit || 0), 0);

  // ➕ Add Extra
  const addExtra = () => {
    if (!extraName || !extraAmount)
      return alert("Enter extra name & amount");

    setExtras([
      ...extras,
      { name: extraName, amount: Number(extraAmount) || 0 },
    ]);

    setExtraName("");
    setExtraAmount("");
  };

  const removeExtra = (index) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  // 💾 Save Bill
  const saveBill = async () => {
    if (!userId) return alert("Login required");
    if (items.length === 0) return alert("Add items first");

    const total = getTotal();
    const paid = Number(paidAmount) || 0;
    const remaining = total - paid;

    const cleanItems = items.map((i) => ({
      id: i.id || "",
      name: i.name || "",
      price: i.price || 0,
      purchasePrice: i.purchasePrice || 0,
      discount: i.discount || 0,
      gst: i.gst || 0,
      qty: i.qty || 0,
      total: i.total || 0,
      profit: i.profit || 0,
      type: i.type || "product",
    }));

    const cleanExtras = extras.map((e) => ({
      name: e.name || "",
      amount: Number(e.amount) || 0,
    }));

    await addDoc(collection(db, "users", userId, "bills"), {
      billNo: billNo || "",
      customerId: customerId || "",
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      items: cleanItems,
      extras: cleanExtras,
      total: total || 0,
      paymentMode: paymentMode || "",
      profit: getProfit() || 0,
      paidAmount: paid,
      remainingAmount: remaining,
      createdAt: new Date(),
    });

    // 🔥 STOCK UPDATE
    for (let item of cleanItems) {
      if (item.type === "product") {
        const productRef = doc(db, "users", userId, "products", item.id);
        const snap = await getDoc(productRef);

        if (snap.exists()) {
          const currentStock = snap.data().stock || 0;

          await updateDoc(productRef, {
            stock: currentStock - item.qty,
          });
        }
      }
    }

    // 👤 Customer update
    if (customerId) {
      await setDoc(
        doc(db, "users", userId, "customers", customerId),
        {
          customerId,
          customerName,
          customerPhone,
          totalAmount: total,
          paidAmount: paid,
          remainingAmount: remaining,
          lastPaymentDate: new Date(),
        },
        { merge: true }
      );
    }

    alert("Bill Saved ✅");
  };

  return (
    <div className="container">
      <h2>Billing</h2>

      <input placeholder="Customer ID" value={customerId}
        onChange={(e) => setCustomerId(e.target.value)} /><br /><br />

      <input placeholder="Customer Name" value={customerName}
        onChange={(e) => setCustomerName(e.target.value)} /><br /><br />

      <input placeholder="Customer Phone" value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)} /><br /><br />

      <input type="number" placeholder="Paid Amount"
        value={paidAmount}
        onChange={(e) => setPaidAmount(e.target.value)}
      /><br /><br />

      <select onChange={(e) =>
        setSelectedProduct(products.find(p => p.id === e.target.value))
      }>
        <option value="">Select Product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} {p.type === "product"
              ? `(Stock: ${p.stock || 0})`
              : "(Service)"}
          </option>
        ))}
      </select>

      <br /><br />

      <input type="number" value={qty}
        onChange={(e) => setQty(Number(e.target.value))} /><br /><br />

      <input placeholder="Extra Discount ₹"
        value={extraDiscount}
        onChange={(e) => setExtraDiscount(e.target.value)}
      /><br /><br />

      <button onClick={addItem}>Add Item</button>

      <h3>Items</h3>
      {items.map((item, i) => (
        <div key={i}>
          {item.name}
          <input type="number" value={item.qty}
            onChange={(e) => updateQty(i, Number(e.target.value))}
            style={{ width: "60px", marginLeft: "10px" }}
          />
          ₹{item.total.toFixed(2)}
          <button onClick={() => removeItem(i)}>❌</button>
          <hr />
        </div>
      ))}

      {/* 🔥 EXTRA CHARGES */}
      <h3>Extra Charges</h3>

      <input placeholder="Charge Name"
        value={extraName}
        onChange={(e) => setExtraName(e.target.value)}
      />

      <input type="number" placeholder="Amount"
        value={extraAmount}
        onChange={(e) => setExtraAmount(e.target.value)}
      />

      <button onClick={addExtra}>Add Charge</button>

      {extras.map((e, i) => (
        <div key={i}>
          {e.name} - ₹{e.amount}
          <button onClick={() => removeExtra(i)}>❌</button>
        </div>
      ))}

      {/* 🔥 BREAKDOWN */}
      <h3>Breakdown</h3>

      <p>Base Price: ₹{getSubtotal().toFixed(2)}</p>
      <p>Discount: -₹{getProductDiscount().toFixed(2)}</p>
      <p>GST: +₹{getGST().toFixed(2)}</p>
      <p>Extra Discount: -₹{extraDiscount || 0}</p>
      <p>Extra Charges: +₹{getExtraTotal().toFixed(2)}</p>

      <h2>Total: ₹{getTotal().toFixed(2)}</h2>

      <p>Paid: ₹{paidAmount || 0}</p>
      <p>Remaining: ₹{(getTotal() - (paidAmount || 0)).toFixed(2)}</p>

      <select value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value)}>
        <option value="">Payment Mode</option>
        <option>Cash</option>
        <option>UPI</option>
        <option>Card</option>
        <option>Bank Transfer</option>
        <option>Other</option>
      </select>

      <br /><br />

<button onClick={handlePrint}>Print Invoice</button>

<button 
  onClick={handleDownloadAndWhatsApp}
  style={{
    background: "#25D366",
    color: "#fff",
    marginLeft: "10px"
  }}
>
  PDF + WhatsApp
</button>

<button 
  onClick={saveBill}
  style={{ marginLeft: "10px" }}
>
  Save Bill
</button>

      <div style={{ display: "none" }}>
        <Invoice
          ref={invoiceRef}
          items={items}
          extras={extras}
          total={getTotal()}
          billNo={billNo}
          customerName={customerName}
          customerPhone={customerPhone}
          customerId={customerId}
          paidAmount={paidAmount}
          profile={profile}
          extraDiscount={extraDiscount}
          paymentMode={paymentMode}
        />
      </div>
    </div>
  );
}