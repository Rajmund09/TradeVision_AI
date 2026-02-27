import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const pageLabels = {
  dashboard: "Dashboard",
  prediction: "AI Prediction Engine",
  portfolio: "Portfolio Manager",
  advisor: "AI Strategy Advisor",
};

export default function Navbar({ onLogout, onMenuToggle, currentPage }) {
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuToggle}>
          <span /><span /><span />
        </button>
        <div className="navbar-breadcrumb">
          <span className="breadcrumb-root">TradeVision</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{pageLabels[currentPage] || currentPage}</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-clock">
          <span className="clock-time">{timeStr}</span>
          <span className="clock-date">{dateStr}</span>
        </div>

        <div className="navbar-live-badge">
          <span className="live-pulse" />
          <span>STOP</span>
        </div>

        <div className="navbar-profile" onClick={() => setProfileOpen(!profileOpen)}>
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "T"}
          </div>
          <div className="profile-info">
            <span className="profile-name">{user?.name || "Trader"}</span>
            <span className="profile-role">Pro Member</span>
          </div>
          <span className="profile-caret">▾</span>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dd-name">{user?.name || "Trader"}</div>
                <div className="dd-email">{user?.email || "trader@example.com"}</div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={onLogout}>
                <span>⏻</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          height: var(--navbar-h);
          background: rgba(8, 15, 26, 0.95);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(12px);
          flex-shrink: 0;
        }
        .navbar-left { display: flex; align-items: center; gap: 16px; }
        .navbar-menu-btn {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .navbar-menu-btn:hover { background: var(--bg-hover); }
        .navbar-menu-btn span {
          display: block;
          width: 18px; height: 2px;
          background: var(--text-secondary);
          border-radius: 1px;
          transition: background 0.2s;
        }
        .navbar-menu-btn:hover span { background: var(--cyan); }
        .navbar-breadcrumb { display: flex; align-items: center; gap: 8px; }
        .breadcrumb-root { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }
        .breadcrumb-sep { color: var(--text-muted); }
        .breadcrumb-current { font-size: 14px; font-weight: 700; color: var(--text-primary); }
        .navbar-right { display: flex; align-items: center; gap: 16px; }
        .navbar-clock {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .clock-time { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .clock-date { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
        .navbar-live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--green-dim);
          border: 1px solid rgba(0,255,136,0.3);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--green);
          font-family: var(--font-mono);
        }
        .live-pulse {
          width: 6px; height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse-glow 1.2s ease-in-out infinite;
        }
        .navbar-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          transition: all 0.2s;
          position: relative;
        }
        .navbar-profile:hover { border-color: var(--border-bright); background: var(--bg-hover); }
        .profile-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #0066cc, var(--cyan));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }
        .profile-info { display: flex; flex-direction: column; }
        .profile-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
        .profile-role { font-size: 10px; color: var(--cyan); font-family: var(--font-mono); }
        .profile-caret { font-size: 10px; color: var(--text-muted); }
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--bg-panel);
          border: 1px solid var(--border-bright);
          border-radius: 12px;
          min-width: 200px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          overflow: hidden;
          animation: slide-up 0.15s ease;
        }
        .dropdown-header { padding: 16px; }
        .dd-name { font-size: 14px; font-weight: 700; }
        .dd-email { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px; }
        .dropdown-divider { height: 1px; background: var(--border); }
        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: none;
          border: none;
          color: var(--red);
          cursor: pointer;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .dropdown-item:hover { background: var(--red-dim); }
        @media (max-width: 640px) {
          .navbar-clock, .navbar-live-badge { display: none; }
          .profile-info { display: none; }
        }
      `}</style>
    </header>
  );
}
