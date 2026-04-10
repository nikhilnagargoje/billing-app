import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import "../styles/stock.css"; // tuzya updated CSS

export default function Stock() {
  const [products, setProducts] = useState([]);
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
    fetchProducts();
  }
}, [userId]);


  const fetchProducts = async () => {
    if (!userId) return;

    const data = await getDocs(
      collection(db, "users", userId, "products")
    );

    setProducts(
      data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  // ✅ SET STOCK
  const setStock = async (id, value) => {
    if (!value) return;
    const ref = doc(db, "users", userId, "products", id);

    await updateDoc(ref, {
      stock: Number(value),
    });

    fetchProducts();
  };

  // ➕ ADD STOCK
  const addStock = async (id, current) => {
    const ref = doc(db, "users", userId, "products", id);

    await updateDoc(ref, {
      stock: (current || 0) + 1,
    });

    fetchProducts();
  };

  // ➖ MINUS STOCK
  const minusStock = async (id, current) => {
    if ((current || 0) <= 0) return;

    const ref = doc(db, "users", userId, "products", id);

    await updateDoc(ref, {
      stock: current - 1,
    });

    fetchProducts();
  };

  return (
    <div className="container">
      <h2>📦 Stock Management</h2>

      {products.length === 0 && <p>No Products Found</p>}

      {products.map((p) => (
        <div key={p.id} className="stock-card">
          <b>{p.name}</b> <br />
          Type: {p.type}

          {p.type === "product" && (
            <>
              <p>Stock: {p.stock || 0}</p>

             <div className="actions">
  <button className="stock-btn minus" onClick={() => minusStock(p.id, p.stock)}>
    <span>−</span>
  </button>
  <button className="stock-btn plus" onClick={() => addStock(p.id, p.stock)}>
    <span>+</span>
  </button>
  <input
    type="number"
    placeholder="Set Stock"
    onBlur={(e) => setStock(p.id, e.target.value)}
  />
</div>

              {p.stock < 5 && (
                <p className="low-stock">⚠️ Low Stock</p>
              )}
            </>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}