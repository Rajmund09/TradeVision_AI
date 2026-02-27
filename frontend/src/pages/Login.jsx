import { useState } from "react";
import { authApi } from "../api/authApi";

export default function Login({ onNavigate }) {
  const [form, setForm] = useState({ email: "demo@demo.com", password: "demo123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("[Login] Sending login request to backend", { username: form.email });
    try {
      const res = await authApi.login(form.email, form.password);
      const token = res.data.access_token;
      console.log("[Login] Received token", token?.substring(0,20)+"...");
      
      // Save token and user to localStorage
      const user = { name: form.email, email: form.email };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Navigate to dashboard using state-based routing
      onNavigate("dashboard");
    } catch (err) {
      console.error("[Login] Backend login failed", err);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb1" />
        <div className="auth-bg-orb orb2" />
        <div className="auth-bg-orb orb3" />
        <div className="auth-grid-lines" />
      </div>

      <div className="auth-card animate-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 24L10 16L16 20L22 10L28 14" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="28" cy="14" r="3" fill="var(--cyan)" />
              <path d="M4 28h24" stroke="rgba(0,200,255,0.3)" strokeWidth="1"/>
            </svg>
          </div>
          <div>
            <div className="auth-logo-name">TradeVision</div>
            <div className="auth-logo-tag">AI Financial Intelligence</div>
          </div>
        </div>

        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Access your AI-powered trading dashboard</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="trader@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Authenticating...</> : "Sign In →"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <button className="auth-link" onClick={() => onNavigate("register")}>
            Create Account
          </button>
        </div>

        <div className="auth-demo-hint">
          <span>⚡ Demo credentials:</span> demo@demo.com / demo123
        </div>
      </div>

      <style>{`
        .auth-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }
        .auth-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 8s ease-in-out infinite;
        }
        .orb1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%);
          top: -200px; left: -100px;
        }
        .orb2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%);
          bottom: -100px; right: -50px;
          animation-delay: -3s;
        }
        .orb3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%);
          top: 50%; right: 30%;
          animation-delay: -6s;
        }
        .auth-grid-lines {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .auth-card {
          background: rgba(8, 15, 26, 0.95);
          border: 1px solid var(--border-bright);
          border-radius: 24px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          position: relative;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(0,200,255,0.05),
            0 40px 80px rgba(0,0,0,0.8),
            0 0 80px rgba(0,200,255,0.06);
        }
        .auth-card::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .auth-logo-icon {
          width: 52px; height: 52px;
          background: var(--cyan-dim);
          border: 1px solid var(--border-bright);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-logo-name {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, var(--cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-logo-tag {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          letter-spacing: 0.05em;
          margin-top: 2px;
        }
        .auth-header { margin-bottom: 28px; }
        .auth-header h1 {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .auth-header p {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
          font-family: var(--font-mono);
        }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-submit { width: 100%; justify-content: center; padding: 14px; font-size: 15px; margin-top: 8px; }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .auth-link {
          background: none;
          border: none;
          color: var(--cyan);
          cursor: pointer;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 600;
          text-decoration: underline;
          padding: 0;
        }
        .auth-error {
          background: var(--red-dim);
          border: 1px solid rgba(255,64,96,0.3);
          border-radius: var(--radius);
          padding: 10px 14px;
          font-size: 13px;
          color: var(--red);
          margin-bottom: 8px;
        }
        .auth-demo-hint {
          margin-top: 16px;
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          padding: 8px;
          background: var(--bg-deep);
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .auth-demo-hint span { color: var(--amber); }
      `}</style>
    </div>
  );
}
