import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const isFormInvalid = !form.email.trim() || !form.password.trim();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (isBlocked) {
      setIsBlocked(false);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlocked) return;

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);

      if (message === "User not found" || message === "Invalid password") {
        setIsBlocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="login-form">
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
            className="login-btn"
            disabled={loading || isBlocked || isFormInvalid}
            style={{
              cursor:
                loading || isBlocked || isFormInvalid
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className="login error-text">{error}</p>}
        <p className="login-redirect" onClick={() => navigate("/signup")}>
          Don’t have an account? <span>Signup</span>
        </p>
      </div>
    </div>
  );
}
