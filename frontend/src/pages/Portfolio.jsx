import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { portfolioApi } from "../api/portfolioApi";
import RiskMeter from "../components/RiskMeter";

export default function Portfolio() {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ symbol: "", qty: "", price: "" });
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState([]);
  const [riskData, setRiskData] = useState({
    diversification_score: 0,
    volatility_risk: 0,
    allocation_imbalance: 0,
  });
  
  // Use ref to track auth error - this prevents stale closure in interval
  const authErrorRef = useRef(false);

  const fetchPortfolioData = async () => {
    // Don't fetch if we already have auth error
    if (authErrorRef.current) return;
    
    try {
      console.log("[Portfolio] Fetching portfolio data for user:", user?.email);
      
      // Fetch holdings
      const portfolioRes = await portfolioApi.getPortfolio();
      console.log("[Portfolio] API Response:", portfolioRes.data);
      
      if (portfolioRes.data && Array.isArray(portfolioRes.data)) {
        const formatted = portfolioRes.data.map(item => ({
          symbol: item.symbol,
          qty: item.quantity,
          avg: item.buy_price,
          ltp: item.buy_price * 1.05, // Mock LTP as 5% higher
          sector: "Unknown",
          weight: 0
        }));
        
        // Calculate weights
        const total = formatted.reduce((sum, h) => sum + (h.qty * h.ltp), 0);
        const withWeights = formatted.map(h => ({
          ...h,
          weight: total > 0 ? ((h.qty * h.ltp) / total * 100).toFixed(1) : 0
        }));
        
        console.log("[Portfolio] Formatted holdings:", withWeights);
        setHoldings(withWeights);
      } else {
        console.log("[Portfolio] No holdings data or empty array");
        setHoldings([]);
      }

      // Fetch risk analysis
      try {
        const riskRes = await portfolioApi.getRiskAnalysis();
        console.log("[Portfolio] Risk analysis:", riskRes.data);
        setRiskData(riskRes.data);
      } catch (err) {
        console.warn("[Portfolio] Risk fetch failed:", err.message);
      }
    } catch (err) {
      console.error("[Portfolio] Fetch error:", err.message);
      if (err.response) {
        console.error("[Portfolio] Status:", err.response.status);
        console.error("[Portfolio] Data:", err.response.data);
        
        // If 401, stop polling - user needs to login
        if (err.response.status === 401) {
          console.warn("[Portfolio] 401 Unauthorized - stopping polling");
          authErrorRef.current = true;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to finish loading before fetching - check if user exists
    if (!user) {
      setLoading(false);
      setHoldings([]);
      return;
    }
    
    // Check if already has auth error before setting up
    if (authErrorRef.current) {
      setLoading(false);
      return;
    }
    
    fetchPortfolioData();

    // Polling every 3 seconds - check ref for auth error
    const interval = setInterval(() => {
      if (!authErrorRef.current && user) {
        fetchPortfolioData();
      } else {
        // Stop the interval if auth error
        clearInterval(interval);
      }
    }, 3000);

    // Listen for portfolio update event
    const handlePortfolioUpdate = (event) => {
      console.log("[Portfolio] Portfolio update event received:", event.detail);
      if (!authErrorRef.current && user) {
        fetchPortfolioData();
      }
    };

    window.addEventListener("portfolioUpdated", handlePortfolioUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("portfolioUpdated", handlePortfolioUpdate);
    };
  }, [user]);

  const totalValue = holdings.reduce((sum, s) => sum + (s.qty * s.ltp), 0);
  const totalCost = holdings.reduce((sum, s) => sum + (s.qty * s.avg), 0);
  const totalPnL = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(2) : 0;

  return (
    <div className="portfolio-page">
      <div className="page-header animate-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Portfolio Manager</h1>
          <p>Track holdings · Monitor risk · Optimize allocation</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Stock</button>
      </div>

      {/* KPI Row */}
      <div className="grid-4 animate-up-delay-1" style={{ marginBottom: 24 }}>
        {[
          { l: "Total Value", v: `₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, c: "var(--cyan)" },
          { l: "Invested", v: `₹${totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, c: "var(--text-primary)" },
          { l: "Unrealized P&L", v: `${totalPnL > 0 ? "+" : ""}₹${totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, c: totalPnL > 0 ? "var(--green)" : "var(--red)" },
          { l: "Total Return", v: `${pnlPct > 0 ? "+" : ""}${pnlPct}%`, c: pnlPct > 0 ? "var(--green)" : "var(--red)" },
        ].map((k, i) => (
          <div className="card" key={i}>
            <div className="stat-label">{k.l}</div>
            <div className="stat-value" style={{ color: k.c, fontSize: 22, marginTop: 8 }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 animate-up-delay-2" style={{ marginBottom: 24 }}>
        {/* Holdings Table */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="section-title">Holdings {loading && " (Loading...)"}</div>
          {holdings.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              {loading ? "Loading portfolio..." : "No holdings yet. Add your first stock!"}
            </div>
          ) : (
            <div className="holdings-table">
              <div className="holdings-header">
                {["Symbol", "Qty", "Avg Price", "LTP", "Current Value", "P&L", "% P&L", "Weight"].map(h => (
                  <span key={h}>{h}</span>
                ))}
              </div>
              {holdings.map((s, i) => {
                const pnl = (s.ltp - s.avg) * s.qty;
                const pnlP = (((s.ltp - s.avg) / s.avg) * 100).toFixed(2);
                const up = pnl >= 0;
                return (
                  <div className="holdings-row" key={i}>
                    <span className="h-symbol">{s.symbol}</span>
                    <span className="h-mono">{s.qty}</span>
                    <span className="h-mono">₹{s.avg.toLocaleString("en-IN")}</span>
                    <span className="h-mono">₹{s.ltp.toLocaleString("en-IN")}</span>
                    <span className="h-mono">₹{(s.qty * s.ltp).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    <span className="h-mono" style={{ color: up ? "var(--green)" : "var(--red)" }}>
                      {up ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                    <span className={`badge ${up ? "badge-up" : "badge-down"}`}>{up ? "+" : ""}{pnlP}%</span>
                    <div className="h-weight">
                      <div className="h-weight-bar">
                        <div style={{ width: `${s.weight}%`, height: "100%", background: "var(--cyan)", borderRadius: 2 }} />
                      </div>
                      <span className="h-mono">{s.weight}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-3 animate-up-delay-3">
        {/* Risk Analysis */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div className="section-title" style={{ alignSelf: "stretch" }}>Portfolio Risk</div>
          <RiskMeter value={riskData.volatility_risk * 100} />
          <div style={{ width: "100%" }}>
            {[
              { l: "Diversification", v: (riskData.diversification_score * 100).toFixed(0), c: "var(--cyan)" },
              { l: "Volatility Risk", v: (riskData.volatility_risk * 100).toFixed(0), c: "var(--amber)" },
              { l: "Allocation Imbalance", v: (riskData.allocation_imbalance * 100).toFixed(0), c: "var(--red)" },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div className="score-bar-wrap">
                  <div className="score-bar-label">
                    <span>{r.l}</span>
                    <span>{r.v}/100</span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${Math.min(r.v, 100)}%`, background: r.c }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings Summary */}
        <div className="card">
          <div className="section-title">Summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Holdings</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{holdings.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Portfolio Value</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)" }}>₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Invested</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)" }}>₹{totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Unrealized P&L</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: totalPnL > 0 ? "var(--green)" : totalPnL < 0 ? "var(--red)" : "var(--text-secondary)" }}>
                {totalPnL > 0 ? "+" : ""}{totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="card">
          <div className="section-title">Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "10px 12px", background: "var(--bg-deep)", borderRadius: 10, border: "1px solid var(--cyan)22" }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", background: "var(--cyan)22", color: "var(--cyan)", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--cyan)44" }}>INFO</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Portfolio syncing with backend in real-time. Check browser console (F12) for detailed logs.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Stock to Portfolio</h3>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 24px 24px" }}>
              <div className="input-group">
                <label>Symbol</label>
                <input className="input" placeholder="e.g. BAJAJFIN"
                  value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Quantity</label>
                <input className="input" type="number" placeholder="0"
                  value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Buy Price (₹)</label>
                <input className="input" type="number" placeholder="0.00"
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => {
                  console.log("[Portfolio] Adding stock manually:", form);
                  // TODO: Implement add stock functionality
                  setShowAdd(false);
                }}>Add Stock</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .holdings-table { overflow-x: auto; }
        .holdings-header, .holdings-row {
          display: grid;
          grid-template-columns: 1.2fr 0.6fr 0.9fr 0.9fr 1fr 1fr 0.8fr 1.2fr;
          gap: 8px;
          align-items: center;
          padding: 10px 12px;
          min-width: 900px;
        }
        .holdings-header {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-family: var(--font-mono);
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }
        .holdings-row {
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .holdings-row:hover { background: var(--bg-hover); border-radius: 8px; }
        .holdings-row:last-child { border-bottom: none; }
        .h-symbol { font-size: 13px; font-weight: 700; font-family: var(--font-mono); color: var(--text-primary); }
        .h-sector { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
        .h-mono { font-size: 12px; font-family: var(--font-mono); color: var(--text-secondary); }
        .h-weight { display: flex; align-items: center; gap: 6px; }
        .h-weight-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; max-width: 60px; }
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
          backdrop-filter: blur(4px);
          animation: fade-in 0.2s ease;
        }
        .modal-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-bright);
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.8);
          animation: slide-up 0.3s ease;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .modal-header h3 { font-size: 16px; font-weight: 700; }
        .modal-close {
          background: var(--bg-deep); border: 1px solid var(--border);
          color: var(--text-secondary); cursor: pointer;
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; transition: all 0.2s;
        }
        .modal-close:hover { color: var(--red); border-color: var(--red); }
      `}</style>
    </div>
  );
}
