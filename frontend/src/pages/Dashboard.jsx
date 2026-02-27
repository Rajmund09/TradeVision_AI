import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { portfolioApi } from "../api/portfolioApi";
import { newsApi } from "../api/newsApi";
import { predictionApi } from "../api/predictionApi";

const tickers = [
  { s: "RELIANCE", v: "2,847.50", c: "+1.24%", up: true },
  { s: "TCS", v: "3,920.00", c: "+0.67%", up: true },
  { s: "HDFC BANK", v: "1,640.25", c: "-0.32%", up: false },
  { s: "INFOSYS", v: "1,720.80", c: "+2.11%", up: true },
  { s: "WIPRO", v: "512.60", c: "-0.88%", up: false },
  { s: "BAJAJ FIN", v: "6,850.00", c: "+1.76%", up: true },
  { s: "ICICI BANK", v: "1,024.35", c: "+0.45%", up: true },
  { s: "LT", v: "3,510.90", c: "-0.21%", up: false },
];

const recentSignals = [
  { symbol: "RELIANCE", signal: "BUY", confidence: 87, time: "2 min ago", color: "green" },
  { symbol: "HDFC BANK", signal: "HOLD", confidence: 62, time: "7 min ago", color: "amber" },
  { symbol: "TCS", signal: "BUY", confidence: 79, time: "12 min ago", color: "green" },
  { symbol: "WIPRO", signal: "SELL", confidence: 73, time: "18 min ago", color: "red" },
  { symbol: "BAJAJ FIN", signal: "BUY", confidence: 91, time: "24 min ago", color: "green" },
];

const miniChart = [40, 55, 48, 72, 60, 83, 70, 90, 78, 95, 88, 100];

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "40px" }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: "2px 2px 0 0",
          height: `${(v / max) * 100}%`,
          background: color,
          opacity: 0.4 + (i / data.length) * 0.6,
        }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use ref to track auth error
  const authErrorRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const loadData = async () => {
    if (authErrorRef.current) return;
    
    let p = [];
    try {
      const resp = await portfolioApi.getPortfolio();
      console.log("[Dashboard] Portfolio API Response:", resp.data);
      p = resp.data || [];
      setPortfolio(p);
    } catch (e) {
      console.warn("[Dashboard] portfolio fetch failed", e.message);
      if (e.response && e.response.status === 401) {
        authErrorRef.current = true;
      }
    }
    
    try {
      const n = await newsApi.getMarketNews(5);
      const data = Array.isArray(n.data) ? n.data : [];
      setMarketNews(data);
    } catch (e) {
      console.warn("[Dashboard] news fetch failed", e.message);
      setMarketNews([]);
    }
    
    // fetch signals for first few holdings
    if (p.length) {
      const syms = p.slice(0, 5).map(h => h.symbol);
      const fetched = [];
      for (const sym of syms) {
        try {
          const r = await predictionApi.getPrediction(sym);
          fetched.push(r.data);
        } catch (_err) {
          console.warn("signal fetch error", sym);
        }
      }
      setSignals(fetched);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Wait for auth to finish loading before fetching
    if (!user) {
      setLoading(false);
      setPortfolio([]);
      return;
    }
    
    loadData();

    // Polling every 10 seconds
    const interval = setInterval(() => {
      if (!authErrorRef.current && user) {
        loadData();
      } else {
        clearInterval(interval);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="dashboard">
      {/* Ticker Tape */}
      <div className="ticker-tape">
        <div className="ticker-inner">
          {[...tickers, ...tickers].map((t, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-sym">{t.s}</span>
              <span className="ticker-val">{t.v}</span>
              <span className={`ticker-chg ${t.up ? "up" : "down"}`}>{t.c}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="page-header animate-up">
        <h1>TradeVision AI</h1>
        <p>Real-time AI analysis · NSE/BSE · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* KPI Row */}
      <div className="grid-4 animate-up-delay-1" style={{ marginBottom: "24px" }}>
        {[
          { label: "Portfolio Items", value: portfolio.length, change: "", up: null, color: "var(--cyan)", icon: "◈", bg: "var(--cyan-dim)" },
          { label: "Active Signals", value: signals.length, change: "", up: true, color: "var(--purple)", icon: "◉", bg: "var(--purple-dim)" },
          { label: "News Articles", value: marketNews.length, change: "", up: null, color: "var(--amber)", icon: "📰", bg: "var(--amber-dim)" },
        ].map((s, i) => (
          <div className="card stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-change" style={{ color: s.up === true ? "var(--green)" : s.up === false ? "var(--red)" : "var(--amber)" }}>
              {s.up === true ? "↑" : s.up === false ? "↓" : "◆"} {s.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 animate-up-delay-2" style={{ marginBottom: "24px" }}>
        {/* Market Overview */}
        <div className="card">
          <div className="section-title">Market Overview</div>
          <div className="market-table">
            {tickers.map((t, i) => (
              <div className="market-row" key={i}>
                <div className="market-row-left">
                  <div className="market-row-symbol">{t.s}</div>
                  <div className="market-row-label">NSE</div>
                </div>
                <div className="mini-spark">
                  <Sparkline
                    data={miniChart.map(v => v + (Math.random() - 0.5) * 20)}
                    color={t.up ? "var(--green)" : "var(--red)"}
                  />
                </div>
                <div className="market-row-right">
                  <div className="market-row-price">₹{t.v}</div>
                  <span className={`badge ${t.up ? "badge-up" : "badge-down"}`}>{t.c}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Signals */}
        <div className="card">
          <div className="section-title">Recent AI Signals</div>
          <div className="signals-list">
            {recentSignals.map((s, i) => (
              <div className="signal-row" key={i}>
                <div className="signal-left">
                  <div className={`signal-badge signal-${s.color}`}>{s.signal}</div>
                  <div>
                    <div className="signal-symbol">{s.symbol}</div>
                    <div className="signal-time">{s.time}</div>
                  </div>
                </div>
                <div className="signal-confidence">
                  <div className="conf-bar-track">
                    <div
                      className="conf-bar-fill"
                      style={{
                        width: `${s.confidence}%`,
                        background: s.color === "green"
                          ? "var(--green)"
                          : s.color === "red" ? "var(--red)" : "var(--amber)"
                      }}
                    />
                  </div>
                  <div className="conf-value">{s.confidence}%</div>
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />
          <div className="signal-summary">
            <div className="summary-item">
              <span className="summary-dot" style={{ background: "var(--green)" }} />
              <span>3 BUY signals</span>
            </div>
            <div className="summary-item">
              <span className="summary-dot" style={{ background: "var(--red)" }} />
              <span>1 SELL signal</span>
            </div>
            <div className="summary-item">
              <span className="summary-dot" style={{ background: "var(--amber)" }} />
              <span>1 HOLD signal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-3 animate-up-delay-3">
        <div className="card">
          <div className="section-title">Portfolio Allocation</div>
          <div className="alloc-chart">
            {[
              { label: "Technology", pct: 40, color: "var(--cyan)" },
              { label: "Banking", pct: 28, color: "var(--purple)" },
              { label: "Energy", pct: 18, color: "var(--amber)" },
              { label: "FMCG", pct: 14, color: "var(--green)" },
            ].map((a, i) => (
              <div className="alloc-row" key={i}>
                <div className="alloc-label-row">
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, display: "inline-block" }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.label}</span>
                  </span>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{a.pct}%</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${a.pct}%`, background: a.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Sentiment Index</div>
          <div className="sentiment-gauge">
            <div className="gauge-display">
              <div className="gauge-arc">
                <svg viewBox="0 0 120 80" width="120" height="80">
                  <path d="M10 70 A50 50 0 0 1 110 70" fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M10 70 A50 50 0 0 1 110 70" fill="none" stroke="var(--green)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray="157" strokeDashoffset="47" />
                </svg>
                <div className="gauge-value">70</div>
                <div className="gauge-label">BULLISH</div>
              </div>
            </div>
            <div className="sentiment-breakdown">
              {[["Positive News", 70, "var(--green)"], ["Negative News", 18, "var(--red)"], ["Neutral", 12, "var(--amber)"]].map(([l, v, c], i) => (
                <div key={i} className="score-bar-wrap" style={{ marginBottom: 8 }}>
                  <div className="score-bar-label">
                    <span style={{ fontSize: 11 }}>{l}</span>
                    <span>{v}%</span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${v}%`, background: c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Top Movers Today</div>
          <div className="movers-list">
            {[
              { s: "BAJAJ FIN", v: "+4.20%", up: true },
              { s: "INFOSYS", v: "+2.11%", up: true },
              { s: "RELIANCE", v: "+1.24%", up: true },
              { s: "WIPRO", v: "-0.88%", up: false },
              { s: "HDFC BANK", v: "-0.32%", up: false },
            ].map((m, i) => (
              <div className="mover-row" key={i}>
                <span className="mover-rank" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                <span className="mover-sym">{m.s}</span>
                <span className={`mover-val ${m.up ? "up" : "down"}`}>{m.v}</span>
                <div className="mover-bar-wrap">
                  <div className="mover-bar" style={{
                    width: `${Math.abs(parseFloat(m.v)) * 20}%`,
                    background: m.up ? "var(--green)" : "var(--red)",
                    opacity: 0.6
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market News Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">Latest Market News</div>
        {marketNews.length === 0 ? (
          <div style={{ padding: 20, color: "var(--text-muted)" }}>
            {loading ? "Loading news..." : "No news available."}
          </div>
        ) : (
          <ul className="news-list" style={{ listStyle: "none", padding: 0 }}>
            {marketNews.slice(0, 5).map((n, i) => (
              <li key={i} className="news-item" style={{ marginBottom: 12 }}>
                <a href={n.url} target="_blank" rel="noreferrer">
                  <h3 style={{ margin: 0, fontSize: 14 }}>{n.title}</h3>
                  <p style={{ margin: 4, fontSize: 12, color: "var(--text-secondary)" }}>{n.summary}</p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`
        .dashboard {}
        .ticker-tape {
          overflow: hidden;
          background: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 10px 0;
          margin-bottom: 24px;
          position: relative;
        }
        .ticker-tape::before, .ticker-tape::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0; width: 60px;
          z-index: 1;
        }
        .ticker-tape::before { left: 0; background: linear-gradient(90deg, var(--bg-panel), transparent); }
        .ticker-tape::after { right: 0; background: linear-gradient(-90deg, var(--bg-panel), transparent); }
        .ticker-inner {
          display: flex;
          gap: 0;
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
          border-right: 1px solid var(--border);
          white-space: nowrap;
        }
        .ticker-sym { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-secondary); }
        .ticker-val { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); }
        .ticker-chg { font-family: var(--font-mono); font-size: 11px; font-weight: 600; }
        .ticker-chg.up { color: var(--green); }
        .ticker-chg.down { color: var(--red); }
        .market-table { display: flex; flex-direction: column; gap: 4px; }
        .market-row {
          display: flex;
          align-items: center;
          padding: 8px 10px;
          border-radius: 8px;
          transition: background 0.2s;
          gap: 12px;
        }
        .market-row:hover { background: var(--bg-hover); }
        .market-row-left { flex: 0 0 100px; }
        .market-row-symbol { font-size: 12px; font-weight: 700; font-family: var(--font-mono); }
        .market-row-label { font-size: 10px; color: var(--text-muted); }
        .mini-spark { flex: 1; }
        .market-row-right { flex: 0 0 100px; text-align: right; }
        .market-row-price { font-family: var(--font-mono); font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        .signals-list { display: flex; flex-direction: column; gap: 12px; }
        .signal-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 10px;
          border-radius: 10px;
          background: var(--bg-deep);
          border: 1px solid var(--border);
        }
        .signal-left { display: flex; align-items: center; gap: 12px; }
        .signal-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          font-family: var(--font-mono);
          letter-spacing: 0.08em;
          min-width: 52px;
          text-align: center;
        }
        .signal-green { background: var(--green-dim); color: var(--green); border: 1px solid rgba(0,255,136,0.3); }
        .signal-red { background: var(--red-dim); color: var(--red); border: 1px solid rgba(255,64,96,0.3); }
        .signal-amber { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(255,176,32,0.3); }
        .signal-symbol { font-size: 13px; font-weight: 700; font-family: var(--font-mono); }
        .signal-time { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
        .signal-confidence { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; width: 80px; }
        .conf-bar-track { width: 80px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .conf-bar-fill { height: 100%; border-radius: 2px; transition: width 1s; }
        .conf-value { font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); }
        .signal-summary { display: flex; gap: 16px; flex-wrap: wrap; }
        .summary-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono); }
        .summary-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .alloc-row { margin-bottom: 12px; }
        .alloc-label-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .sentiment-gauge { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .gauge-display { display: flex; justify-content: center; }
        .gauge-arc { position: relative; }
        .gauge-value { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); font-size: 24px; font-weight: 800; font-family: var(--font-mono); color: var(--green); }
        .gauge-label { position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted); white-space: nowrap; }
        .sentiment-breakdown { width: 100%; }
        .movers-list { display: flex; flex-direction: column; gap: 8px; }
        .mover-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px; transition: background 0.2s; }
        .mover-row:hover { background: var(--bg-hover); }
        .mover-rank { font-size: 11px; font-family: var(--font-mono); width: 20px; }
        .mover-sym { font-size: 12px; font-weight: 700; font-family: var(--font-mono); flex: 1; }
        .mover-val { font-size: 12px; font-weight: 700; font-family: var(--font-mono); width: 56px; text-align: right; }
        .mover-val.up { color: var(--green); }
        .mover-val.down { color: var(--red); }
        .mover-bar-wrap { width: 50px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .mover-bar { height: 100%; border-radius: 2px; }
      `}</style>
    </div>
  );
}
