import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import "../styles/pages/login.css";

const DEMO = {
  agentA: { email: "agent@demo.com", password: "Agent123!" },
  agentB: { email: "agent2@demo.com", password: "Agent123!" },
  customer: { email: "customer@demo.com", password: "Customer123!" },
  admin: { email: "admin@demo.com", password: "Admin123!" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Defaults demo (Agent A)
  const [email, setEmail] = useState(DEMO.agentA.email);
  const [password, setPassword] = useState(DEMO.agentA.password);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return !!email.trim() && !!password.trim() && !loading;
  }, [email, password, loading]);

  function fillDemo(kind) {
    setEmail(DEMO[kind].email);
    setPassword(DEMO[kind].password);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const nextEmail = email.trim();
    const nextPassword = password.trim();

    if (!nextEmail || !nextPassword) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(nextEmail, nextPassword);
      navigate("/tickets", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page loginPage">
      <div className="container loginPage__container">
        <div className="card loginCard">
          <div className="loginCard__inner">
            {/* LEFT SIDE */}
            <div className="loginLeft">
              <h1 className="loginLeft__title">Welcome back</h1>
              <p className="loginLeft__subtitle">
                Sign in to manage tickets and keep your knowledge base tidy — all in one place.
              </p>

              <div className="loginLeft__demo">
                <div className="loginLeft__demoTitle">Demo accounts</div>
                <div className="loginLeft__demoRow">
                  Choose a role to sign in instantly.
                </div>

                <div className="loginLeft__demoButtons">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => fillDemo("agentA")}
                    disabled={loading}
                  >
                    Login as Agent A
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => fillDemo("agentB")}
                    disabled={loading}
                  >
                    Login as Agent B
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => fillDemo("customer")}
                    disabled={loading}
                  >
                    Login as Customer
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => fillDemo("admin")}
                    disabled={loading}
                  >
                    Login as Admin
                  </button>
                </div>

                <div className="loginLeft__demoNote">
                  Tip: passwords are hidden in the UI, but prefilled for convenience.
                </div>
              </div>
            </div>

            <div className="loginCard__divider" />

            {/* RIGHT SIDE */}
            <div className="loginRight">
              <div className="loginRight__header">
                <h2 className="loginRight__title">Login</h2>
                <p className="loginRight__text">Use the demo buttons or enter credentials manually.</p>
              </div>

              <form className="loginForm" onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field__label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    className="input"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="alert alert--danger" role="alert" aria-live="polite">
                    <b>Oops.</b> {error}
                  </div>
                )}

                <button
                  className="btn btn--primary loginForm__submit"
                  type="submit"
                  disabled={!canSubmit}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>

                <div className="loginForm__hint">This is a demo MVP 🙂</div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}