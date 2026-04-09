import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import "../styles/products.css";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function Products() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [gst, setGst] = useState("");
  const [code, setCode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [type, setType] = useState("product");
  const [stock, setStock] = useState("");
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);

  const userId = auth.currentUser?.uid;

  // Fetch products
  const fetchProducts = async () => {
    if (!userId) return;
    const data = await getDocs(collection(db, "users", userId, "products"));
    setProducts(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchProducts(); }, [userId]);

  // Save / Update
  const handleSave = async () => {
    if (!name || !price) return alert("Fill all fields");
    if (!userId) return alert("Login required");

    const productData = {
      name,
      code: code || "",
      price: Number(price),
      purchasePrice: Number(purchasePrice) || 0,
      discount: Number(discount) || 0,
      gst: Number(gst) || 0,
      type,
      stock: type === "product" ? Number(stock) || 0 : 0,
    };

    if (editId) {
      await updateDoc(doc(db, "users", userId, "products", editId), productData);
      setEditId(null);
    } else {
      await addDoc(collection(db, userId, "products"), productData);
    }

    setName(""); setPrice(""); setDiscount(""); setGst("");
    setCode(""); setPurchasePrice(""); setType("product"); setStock("");
    fetchProducts();
  };

  const handleEdit = (p) => {
    setName(p.name || "");
    setPrice(p.price || "");
    setDiscount(p.discount || "");
    setGst(p.gst || "");
    setCode(p.code || "");
    setPurchasePrice(p.purchasePrice || "");
    setType(p.type || "product");
    setStock(p.stock || "");
    setEditId(p.id);
  };

  const handleDelete = async (id) => {
    if (!userId) return;
    await deleteDoc(doc(db, "users", userId, "products", id));
    fetchProducts();
  };

  const getFinalPrice = (p) => {
    let price = p.price;
    price = price - (price * (p.discount || 0)) / 100;
    price = price + (price * (p.gst || 0)) / 100;
    return price.toFixed(2);
  };

  return (
    <div className="container">
      <h2>Products / Services</h2>

      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Selling Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <input placeholder="Purchase Price" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
      <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
      <input placeholder="Discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} />
      <input placeholder="GST %" value={gst} onChange={(e) => setGst(e.target.value)} />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="product">Product</option>
        <option value="service">Service</option>
      </select>

      {type === "product" && <input placeholder="Stock Quantity" value={stock} onChange={(e) => setStock(e.target.value)} />}

      <button onClick={handleSave}>{editId ? "Update" : "Add"}</button>

      <h3>List</h3>

{products.map((p) => (
  <div key={p.id} className="product-card">
    
    <b>{p.name}</b>

    <div className="product-info">
      <span>Type: {p.type || "product"}</span>
      <span>Code: {p.code || "-"}</span>

      <span>Selling: <span className="selling">₹{p.price}</span></span>
      <span>Cost: <span className="cost">₹{p.purchasePrice || 0}</span></span>

      <span>Discount: {p.discount || 0}%</span>
      <span>GST: {p.gst || 0}%</span>

      {p.type === "product" && (
        <span className={p.stock < 5 ? "low-stock" : ""}>
          Stock: {p.stock || 0}
        </span>
      )}

      <span>
        Final: <span className="final">₹{getFinalPrice(p)}</span>
      </span>
    </div>

    <div className="product-actions">
      <button onClick={() => handleEdit(p)}>Edit</button>
      <button onClick={() => handleDelete(p.id)}>Delete</button>
    </div>

  </div>
))}
    </div>
  );
}