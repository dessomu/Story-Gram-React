import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./styles/Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/signup", form);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Create Account</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>

        <p className="signup-redirect" onClick={() => navigate("/login")}>
          Already have an account? <span>Login</span>
        </p>
      </div>
    </div>
  );
}
