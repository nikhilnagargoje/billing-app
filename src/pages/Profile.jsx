import { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/profile.css";

export default function Profile() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState("");
  const [gstin, setGstin] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [businessType, setBusinessType] = useState("");

  const [userId, setUserId] = useState(null);

  // ✅ Auth ready fix
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserId(user.uid);
    }
  });

  return () => unsubscribe();
}, []);

  // 🔥 Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      const refDoc = doc(db, "users", userId, "profile", "data");
      const snap = await getDoc(refDoc);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setLogo(data.logo || "");
        setGstin(data.gstin || "");
        setEmail(data.email || "");
        setState(data.state || "");
        setPincode(data.pincode || "");
        setBusinessType(data.businessType || "");
      }
    };

    fetchProfile();
  }, [userId]);

  // 💾 Save Profile
  const saveProfile = async () => {
    if (!userId) return alert("User not logged in");

    await setDoc(
      doc(db, "users", userId, "profile", "data"),
      {
        name,
        phone,
        address,
        logo,
        gstin,
        email,
        state,
        pincode,
        businessType,
      },
      { merge: true }
    );

    alert("Profile Saved ✅");
  };

  return (
    <div className="profile-container">
      <h2>Business Profile</h2>

      <div className="profile-card">

        {/* 🔥 LOGO PREVIEW */}
        <div className="logo-preview">
          {logo ? (
            <img src={logo} alt="Logo" />
          ) : (
            <span>Logo Preview</span>
          )}
        </div>

        {/* 🔥 URL INPUT ONLY */}
        <input
          placeholder="Paste Logo Image URL"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
        />

        <div className="profile-fields">
          <input placeholder="Shop Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input placeholder="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
          <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
          <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
  <option value="">Select Business Type</option>
  <option value="product">🛒 Product Based</option>
  <option value="service">🛠 Service Based</option>
</select>
          </div>

        <button className="save-btn" onClick={saveProfile}>
          Save Profile
        </button>
      </div>
    </div>
  );
}