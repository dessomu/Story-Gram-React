import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./styles/Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const isFormInvalid =
    !form.name.trim() || !form.email.trim() || !form.password.trim();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // ✅ unlock when user edits input
    if (isBlocked) {
      setIsBlocked(false);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormInvalid || isBlocked) return;

    try {
      setLoading(true);
      setError("");

      await API.post("/auth/signup", form);

      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      setError(message);

      // ✅ block only for email conflict
      if (message === "Email already exists") {
        setIsBlocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Create Account</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="signup-btn"
            disabled={loading || isBlocked || isFormInvalid}
            style={{
              cursor:
                loading || isBlocked || isFormInvalid
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>
        {error && <p className="signup error-text">{error}</p>}
        <p className="signup-redirect" onClick={() => navigate("/login")}>
          Already have an account? <span>Login</span>
        </p>
      </div>
    </div>
  );
}
