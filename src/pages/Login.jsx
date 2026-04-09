import { useState } from "react";
import { auth } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      if (!email || !password) {
        setError("Email & Password required!");
        setLoading(false);
        return;
      }

      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isSignup ? "Signup" : "Login"}</h2>

        {error && <p className="error-msg">{error}</p>}

        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className={`login-btn ${loading ? "disabled" : ""}`}
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? "Processing..." : isSignup ? "Signup" : "Login"}
        </button>

        <p className="switch-text">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span className="switch-btn" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Signup"}
          </span>
        </p>
      </div>
    </div>
  );
}