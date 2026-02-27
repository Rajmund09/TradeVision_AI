import { useState } from "react";
import ChatWidget from "../components/ChatWidget";
import { advisorApi } from "../api/advisorApi";

const SUGGESTIONS = [
  "What's the best strategy for my current portfolio?",
  "Should I buy more RELIANCE now?",
  "How can I reduce my portfolio risk?",
  "Which Nifty 50 stocks are bullish today?",
  "Explain the sentiment score for TCS",
];

const AI_RESPONSES = {
  default: `📊 **Portfolio Strategy Analysis**

Based on your current portfolio composition:

**Key Observations:**
• Tech concentration is high at 45.1% — above optimal 35%
• RELIANCE showing strong momentum (+1.24% today)
• WIPRO in bearish territory — watch for stop loss breach

**Recommended Actions:**
1. ✅ HOLD RELIANCE — target ₹3,120 | Stop: ₹2,650
2. ✅ BUY INFOSYS on dips — AI confidence 84%
3. ⚠️ REDUCE WIPRO — consider booking partial profits
4. 🔄 REBALANCE — add healthcare/FMCG exposure

**Risk Assessment:** Moderate (42/100)
Your portfolio beta is 1.12 — slightly aggressive. Consider adding defensive stocks.`,

  reliance: `🔍 **RELIANCE Analysis**

Current Price: ₹2,847.50 | Target: ₹3,120 | Stop: ₹2,650

**AI Prediction:** STRONG BUY (87% confidence)

**Bullish Factors:**
• LSTM trend score: 82/100 — strong uptrend
• Jio subscriber growth beating estimates
• Retail segment EBITDA margin expansion
• RSI at 62 — not overbought, room to run
• Institutional buying: ₹2,400 Cr net inflow this week

**Verdict:** Add on dips to ₹2,780-2,800 zone. 3-month target ₹3,120.`,

  risk: `🛡️ **Risk Reduction Strategy**

Your portfolio risk score is 42/100 (Moderate). Here's how to optimize:

**1. Diversification (Priority: HIGH)**
   → Add Banking: Target 30% from current 22%
   → Add Healthcare: 0% → 15% target
   → Add Pharma: SUNPHARMA, DRREDDY recommended

**2. Reduce Tech Concentration**
   → Current: 45.1% | Target: 30-35%
   → Book partial profits in INFOSYS (+11% since entry)

**3. Set Stop Losses**
   → WIPRO: ₹490 (breach = strong SELL signal)
   → HDFC BANK: ₹1,580 (support zone)

**Post-optimization risk score estimate: 28-32/100 (Low)**`,
};

function getResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes("reliance")) return AI_RESPONSES.reliance;
  if (m.includes("risk")) return AI_RESPONSES.risk;
  return AI_RESPONSES.default;
}

export default function Advisor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI Strategy Advisor. I have access to your portfolio data, latest AI predictions, and real-time market sentiment.\n\nHow can I help you today? Try asking about your portfolio strategy, specific stocks, or risk management." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await advisorApi.chat(userMsg);
      const bot = resp.data?.response || "(no reply)";
      setMessages(prev => [...prev, { role: "assistant", content: bot }]);
    } catch (err) {
      console.error("Advisor API error", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't reach the advisor service." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advisor-page">
      <div className="page-header animate-up">
        <h1>AI Strategy Advisor</h1>
        <p>Powered by portfolio data + predictions + market sentiment</p>
      </div>

      <div className="advisor-layout animate-up-delay-1">
        {/* Left Panel */}
        <div className="advisor-sidebar">
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-title">Quick Queries</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-btn" onClick={() => setInput(s)}>
                  <span style={{ color: "var(--cyan)", fontSize: 12 }}>▸</span>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title">Context Used</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "◈", label: "AI Predictions", count: "5 stocks", active: true },
                { icon: "◉", label: "Portfolio Data", count: "5 holdings", active: true },
                { icon: "📰", label: "News Sentiment", count: "42 articles", active: true },
                { icon: "⬡", label: "Risk Scores", count: "Live", active: true },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--bg-deep)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <span style={{ color: c.active ? "var(--cyan)" : "var(--text-muted)", fontSize: 16 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{c.count}</div>
                  </div>
                  {c.active && <span style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%", animation: "pulse-glow 2s infinite" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="card advisor-chat">
          <div className="advisor-chat-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: "var(--cyan-dim)", border: "1px solid var(--border-bright)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--cyan)" }}>◎</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>TradeVision AI Advisor</div>
                <div style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, background: "var(--green)", borderRadius: "50%", animation: "pulse-glow 1.5s infinite", display: "inline-block" }} />
                  Online · Context loaded
                </div>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => setMessages([{ role: "assistant", content: "Hello! I'm your AI Strategy Advisor. How can I help you today?" }])}>
              Clear
            </button>
          </div>
          <ChatWidget messages={messages} input={input} setInput={setInput} onSend={send} loading={loading} />
        </div>
      </div>

      <style>{`
        .advisor-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
        .advisor-sidebar {}
        .advisor-chat { padding: 0; overflow: hidden; }
        .advisor-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .suggestion-btn {
          width: 100%;
          text-align: left;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.4;
        }
        .suggestion-btn:hover { background: var(--cyan-dim); border-color: var(--border-bright); color: var(--text-primary); }
        @media (max-width: 900px) {
          .advisor-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
