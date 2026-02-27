import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";

export default function Register({ onNavigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setLoading(true);
    setError("");

    try {
      // register then login
      await authApi.register(form.email, form.password);
      const res = await authApi.login(form.email, form.password);
      const token = res.data.access_token;
      login({ name: form.name || "Demo User", email: "demo@demo.com" }, token);
    } catch (err) {
      console.error("[Register] Error", err);
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb1" />
        <div className="auth-bg-orb orb2" />
        <div className="auth-grid-lines" />
      </div>

      <div className="auth-card animate-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 24L10 16L16 20L22 10L28 14" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="28" cy="14" r="3" fill="var(--cyan)" />
            </svg>
          </div>
          <div>
            <div className="auth-logo-name">TradeVision</div>
            <div className="auth-logo-tag">Create your account</div>
          </div>
        </div>

        <div className="auth-header">
          <h1>Get Started</h1>
          <p>Join thousands of AI-powered traders</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input className="input" type="text" placeholder="John Trader"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input className="input" type="email" placeholder="trader@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" placeholder="Min 8 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input className="input" type="password" placeholder="Re-enter password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Creating Account...</> : "Create Account →"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <button className="auth-link" onClick={() => onNavigate("login")}>Sign In</button>
        </div>
      </div>

      <style>{`
        .auth-page { width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;position:relative;overflow:hidden; }
        .auth-bg { position:fixed;inset:0;pointer-events:none; }
        .auth-bg-orb { position:absolute;border-radius:50%;filter:blur(80px);animation:float 8s ease-in-out infinite; }
        .orb1 { width:600px;height:600px;background:radial-gradient(circle,rgba(0,200,255,0.08) 0%,transparent 70%);top:-200px;left:-100px; }
        .orb2 { width:400px;height:400px;background:radial-gradient(circle,rgba(168,85,247,0.08) 0%,transparent 70%);bottom:-100px;right:-50px;animation-delay:-3s; }
        .auth-grid-lines { position:absolute;inset:0;background-image:linear-gradient(rgba(0,200,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.04) 1px,transparent 1px);background-size:60px 60px; }
        .auth-card { background:rgba(8,15,26,0.95);border:1px solid var(--border-bright);border-radius:24px;padding:40px;width:100%;max-width:420px;position:relative;backdrop-filter:blur(20px);box-shadow:0 40px 80px rgba(0,0,0,0.8),0 0 80px rgba(0,200,255,0.06); }
        .auth-card::before { content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent); }
        .auth-logo { display:flex;align-items:center;gap:12px;margin-bottom:32px; }
        .auth-logo-icon { width:52px;height:52px;background:var(--cyan-dim);border:1px solid var(--border-bright);border-radius:14px;display:flex;align-items:center;justify-content:center; }
        .auth-logo-name { font-size:20px;font-weight:800;background:linear-gradient(135deg,#fff 0%,var(--cyan) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .auth-logo-tag { font-size:11px;color:var(--text-muted);font-family:var(--font-mono);letter-spacing:0.05em;margin-top:2px; }
        .auth-header { margin-bottom:28px; }
        .auth-header h1 { font-size:26px;font-weight:800;letter-spacing:-0.02em; }
        .auth-header p { font-size:13px;color:var(--text-secondary);margin-top:4px;font-family:var(--font-mono); }
        .auth-form { display:flex;flex-direction:column;gap:16px; }
        .auth-submit { width:100%;justify-content:center;padding:14px;font-size:15px;margin-top:8px; }
        .auth-footer { margin-top:24px;text-align:center;font-size:13px;color:var(--text-secondary); }
        .auth-link { background:none;border:none;color:var(--cyan);cursor:pointer;font-family:var(--font-display);font-size:13px;font-weight:600;text-decoration:underline;padding:0; }
        .auth-error { background:var(--red-dim);border:1px solid rgba(255,64,96,0.3);border-radius:var(--radius);padding:10px 14px;font-size:13px;color:var(--red);margin-bottom:8px; }
      `}</style>
    </div>
  );
}
