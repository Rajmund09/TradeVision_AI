const nav = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "prediction", label: "AI Prediction", icon: "◈" },
  { id: "portfolio", label: "Portfolio", icon: "◉" },
  { id: "advisor", label: "AI Advisor", icon: "◎" },
  { id: "alerts", label: "Alerts", icon: "⚠️" },
];

const marketData = [
  { symbol: "NIFTY 50", value: "22,147", change: "+0.84%", up: true },
  { symbol: "SENSEX", value: "73,204", change: "+0.72%", up: true },
  { symbol: "BTC/USD", value: "67,440", change: "-1.20%", up: false },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className={`sidebar-logo ${isOpen ? "" : "collapsed"}`}>
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M4 24L10 16L16 20L22 10L28 14" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="28" cy="14" r="3" fill="var(--cyan)" />
            </svg>
          </div>
          {isOpen && (
            <div>
              <div className="logo-name">TradeVision</div>
              <div className="logo-sub">AI Platform</div>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {isOpen ? "◁" : "▷"}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">{isOpen && "Navigation"}</div>
        {nav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            title={!isOpen ? item.label : ""}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
            {isOpen && currentPage === item.id && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>

      {isOpen && (
        <div className="sidebar-market">
          <div className="sidebar-nav-label">Live Market</div>
          {marketData.map((m) => (
            <div className="market-mini-row" key={m.symbol}>
              <div className="market-mini-symbol">{m.symbol}</div>
              <div className="market-mini-right">
                <span className="market-mini-value">{m.value}</span>
                <span className={`market-mini-change ${m.up ? "up" : "down"}`}>{m.change}</span>
              </div>
            </div>
          ))}
          <div className="market-status">
            <span className="status-dot" />
            Markets Open
          </div>
        </div>
      )}

      <style>{`
        .sidebar {
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          width: var(--sidebar-w);
          background: var(--bg-panel);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .sidebar.closed { width: 72px; }
        .sidebar-header {
          padding: 20px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          min-height: 72px;
          flex-shrink: 0;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
          flex: 1;
        }
        .logo-icon {
          width: 40px; height: 40px;
          flex-shrink: 0;
          background: var(--cyan-dim);
          border: 1px solid var(--border-bright);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-name {
          font-size: 16px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, var(--cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }
        .logo-sub { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); white-space: nowrap; }
        .sidebar-toggle {
          background: var(--bg-deep);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          width: 28px; height: 28px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .sidebar-toggle:hover { color: var(--cyan); border-color: var(--cyan); }
        .sidebar-nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
        .sidebar-nav-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 0 8px;
          margin-bottom: 8px;
          white-space: nowrap;
        }
        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 10px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          text-align: left;
          margin-bottom: 4px;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
        }
        .nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
        .nav-item.active {
          background: var(--cyan-dim);
          color: var(--cyan);
          border-color: var(--border-bright);
        }
        .nav-icon { font-size: 17px; flex-shrink: 0; width: 20px; text-align: center; }
        .nav-label { flex: 1; }
        .nav-active-dot {
          width: 6px; height: 6px;
          background: var(--cyan);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--cyan);
          flex-shrink: 0;
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .sidebar-market {
          padding: 16px 12px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .market-mini-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 8px;
          border-radius: 8px;
          margin-bottom: 2px;
          transition: background 0.2s;
        }
        .market-mini-row:hover { background: var(--bg-hover); }
        .market-mini-symbol {
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          font-weight: 500;
        }
        .market-mini-right { display: flex; flex-direction: column; align-items: flex-end; }
        .market-mini-value {
          font-size: 12px;
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--text-primary);
        }
        .market-mini-change {
          font-size: 10px;
          font-family: var(--font-mono);
          font-weight: 500;
        }
        .market-mini-change.up { color: var(--green); }
        .market-mini-change.down { color: var(--red); }
        .market-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px;
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--text-muted);
          margin-top: 8px;
        }
        .status-dot {
          width: 6px; height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        @media (max-width: 640px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); box-shadow: 4px 0 40px rgba(0,0,0,0.8); }
        }
          
      `}</style>
    </aside>
  );
}
