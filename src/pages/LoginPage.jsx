import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import "../styles/pages/login.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Demo defaults
  const [email, setEmail] = useState("agent@demo.com");
  const [password, setPassword] = useState("Agent123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/tickets");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page loginPage">
      <div className="container loginPage__container">
        {/* Card */}
        <div className="card loginCard">
          <div className="loginCard__inner">

            {/* LEFT SIDE */}
            <div className="loginLeft">
              <h1 className="loginLeft__title">Welcome back</h1>
              <p className="loginLeft__subtitle">
                Sign in to manage tickets and keep your knowledge base tidy — all in one place.
              </p>

              <div className="loginLeft__demo">
                <div className="loginLeft__demoTitle">Demo credentials - Agent</div>
                <div className="loginLeft__demoRow">
                  Email: <code>agent@demo.com</code>
                </div>
                <div className="loginLeft__demoRow">
                  Password: <code>Agent123!</code>
                </div>
              </div>
              <div className="loginLeft__demo">
                <div className="loginLeft__demoTitle">Demo credentials - Customer</div>
                <div className="loginLeft__demoRow">
                  Email: <code>customer@demo.com</code>
                </div>
                <div className="loginLeft__demoRow">
                  Password: <code>Customer123!</code>
                </div>
              </div>
            </div>

            <div className="loginCard__divider" />

            {/* RIGHT SIDE */}
            <div className="loginRight">
              <div className="loginRight__header">
                <h2 className="loginRight__title">Login</h2>
                <p className="loginRight__text">
                  Use the demo credentials to explore.
                </p>
              </div>

              <form className="loginForm" onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field__label">Email</label>
                  <input
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="field">
                  <label className="field__label">Password</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="alert alert--danger">
                    <b>Oops.</b> {error}
                  </div>
                )}

                <button
                  className="btn btn--primary loginForm__submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>

                <div className="loginForm__hint">
                  This is a demo MVP 🙂
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}