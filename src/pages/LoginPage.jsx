
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export function LoginPage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");

  if (user) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <h1 className="page-title">You are already signed in</h1>
          <p className="page-subtitle">
            Manage your details or review orders from your profile.
          </p>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/")}
            >
              Back to catalog
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/profile")}
            >
              Go to profile
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await login(email, password);
      addToast("Signed in.", "success");
      navigate("/profile");
    } catch (err) {
      addToast(err?.message ?? "Login failed.", "error");
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <h1 className="page-title">Sign in</h1>
        <p className="page-subtitle">
          Enter the email and password of your existing Astral Bloom account.
        </p>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="checkout-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Sign in
            </button>
          </div>
        </form>

        <p
          className="page-subtitle"
          style={{ marginTop: "0.8rem", fontSize: "0.8rem" }}
        >
          New to Astral Bloom?{" "}
          <Link to="/register" style={{ color: "#c2a368" }}>
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
