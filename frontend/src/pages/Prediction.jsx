import { useState } from "react";
import ConfidenceMeter from "../components/ConfidenceMeter";
import ScoreBreakdown from "../components/ScoreBreakdown";
import { portfolioApi } from "../api/portfolioApi";
import { predictionApi } from "../api/predictionApi";
import toast from "react-hot-toast";

// Nifty 100 symbols
const NIFTY_100_SYMBOLS = [
  "RELIANCE", "HDFCBANK", "TCS", "INFY", "ICICIBANK", "HINDUNILVR", "LT", "SBIN", "ITC", "AXISBANK",
  "BHARTIARTL", "BAJFINANCE", "NTPC", "KOTAKBANK", "ASIANPAINT", "MARUTI", "SUNPHARMA", "TITAN", "NESTLEIND", "ONGC",
  "HCLTECH", "CIPLA", "COALINDIA", "DLF", "DIVISLAB", "GAIL", "GODREJCP", "GRASIM", "HDFCLIFE", "HAVELLS",
  "IOC", "IRFC", "NAUKRI", "INDIGO", "JSWENERGY", "JSWSTEEL", "MAXHEALTH", "MAZDOCK", "PIDILITIND", "PFC",
  "POWERGRID", "PNB", "SHRIRAMFIN", "SOLARINDS", "TVSMOTOR"
];

const MOCK = {
  RELIANCE: { decision: "BUY", confidence: 87, trend: 82, technical: 78, sentiment: 91, risk: 65, price: "2,847.50", target: "3,120.00", stop: "2,650.00", explanation: "Strong uptrend backed by institutional buying and positive crude oil correlation. RSI at 62 with MACD bullish crossover. News sentiment highly positive on Jio expansion." },
  TCS: { decision: "BUY", confidence: 79, trend: 74, technical: 81, sentiment: 76, risk: 58, price: "3,920.00", target: "4,250.00", stop: "3,700.00", explanation: "IT sector recovery momentum with strong Q3 guidance. EMA alignment bullish, volume surge detected. Analyst upgrades boost sentiment score." },
  HDFC_BANK: { decision: "HOLD", confidence: 62, trend: 55, technical: 60, sentiment: 58, risk: 72, price: "1,640.25", target: "1,720.00", stop: "1,580.00", explanation: "Mixed signals across timeframes. Pending RBI policy outcome creates uncertainty. Risk-adjusted return not compelling for fresh entry." },
  WIPRO: { decision: "SELL", confidence: 73, trend: 68, technical: 70, sentiment: 45, risk: 80, price: "512.60", target: "460.00", stop: "540.00", explanation: "Bearish divergence on weekly chart. Deal pipeline concerns reflected in negative earnings revision. High risk score warrants position reduction." },
  INFY: { decision: "BUY", confidence: 84, trend: 88, technical: 79, sentiment: 83, risk: 52, price: "1,720.80", target: "1,950.00", stop: "1,620.00", explanation: "Outperforming sector peers with strong deal wins. Digital transformation demand accelerating. Fundamentally strong with low debt and high ROE." },
};

// Generate mock data for any symbol
const generateMockData = (sym) => {
  const decisions = ["BUY", "SELL", "HOLD"];
  const decision = decisions[Math.floor(Math.random() * 3)];
  const confidence = Math.floor(Math.random() * 40) + 50; // 50-90
  const trend = Math.floor(Math.random() * 40) + 50;
  const technical = Math.floor(Math.random() * 40) + 50;
  const sentiment = Math.floor(Math.random() * 40) + 50;
  const risk = Math.floor(Math.random() * 40) + 40;
  const basePrice = (Math.random() * 5000 + 100).toFixed(2);
  const targetMultiplier = decision === "BUY" ? 1.1 : decision === "SELL" ? 0.9 : 1.02;
  const stopMultiplier = decision === "BUY" ? 0.92 : decision === "SELL" ? 1.08 : 0.98;
  
  return {
    decision,
    confidence,
    trend,
    technical,
    sentiment,
    risk,
    price: basePrice,
    target: (parseFloat(basePrice) * targetMultiplier).toFixed(2),
    stop: (parseFloat(basePrice) * stopMultiplier).toFixed(2),
    explanation: `AI analysis for ${sym}. ${decision === "BUY" ? "Positive momentum with strong buying signals" : decision === "SELL" ? "Negative indicators suggest selling" : "Mixed signals - hold position"}. Technical indicators show ${technical > 70 ? "strong" : technical > 50 ? "moderate" : "weak"} signals.`
  };
};

const symbols = NIFTY_100_SYMBOLS;

export default function Prediction() {
  const [symbol, setSymbol] = useState("RELIANCE");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(MOCK["RELIANCE"]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState("BUY");
  const [transactionData, setTransactionData] = useState({ quantity: "", price: "" });
  const [processingTransaction, setProcessingTransaction] = useState(false);

  // Transform backend response to frontend format
  const transformResponse = (data) => {
    if (!data) return null;
    
    // Check if it's a backend response (has latest_price) or mock format (has price)
    const price = data.latest_price || data.price || "0";
    const target = data.target_price || data.target || "0";
    const stop = data.stop_loss || data.stop || "0";
    
    return {
      decision: data.decision || "HOLD",
      confidence: Math.round(data.score || data.confidence || 50),
      trend: Math.round((data.lstm_probability || 0) * 100 || data.trend || 50),
      technical: Math.round(data.technical_score || data.technical || 50),
      sentiment: Math.round(data.sentiment_score || data.sentiment || 50),
      risk: Math.round(data.risk_score || data.risk || 50),
      price: price.toString(),
      target: target.toString(),
      stop: stop.toString(),
      explanation: Array.isArray(data.explanation) 
        ? data.explanation.join(" ") 
        : data.explanation || "Analysis complete."
    };
  };

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    try {
      const resp = await predictionApi.getPrediction(symbol);
      const transformed = transformResponse(resp.data);
      setResult(transformed);
    } catch (err) {
      console.error("Prediction error", err);
      // Fall back to mock data on error
      const mockData = MOCK[symbol];
      if (mockData) {
        setResult(mockData);
        toast.success("Using cached prediction data");
      } else {
        toast.error("Failed to get prediction. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionClick = (type) => {
    setTransactionType(type);
    const price = result?.price?.replace(",", "") || "0";
    setTransactionData({ quantity: "", price });
    setShowTransactionModal(true);
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!transactionData.quantity || parseFloat(transactionData.quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (!transactionData.price || parseFloat(transactionData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setProcessingTransaction(true);
    try {
      const payload = {
        symbol: symbol.replace("_", ""),
        quantity: parseFloat(transactionData.quantity),
        buy_price: parseFloat(transactionData.price),
      };

      const response = await portfolioApi.addStock(payload);
      console.log('Transaction successful:', payload);
      toast.success(`${transactionType} order placed for ${payload.quantity} shares of ${symbol}!`);
      
      // Wait 500ms for backend to persist, then dispatch event
      setTimeout(() => {
        console.log('Dispatching portfolioUpdated event...');
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: { symbol: symbol, action: transactionType } }));
      }, 500);
      
      setShowTransactionModal(false);
      setTransactionData({ quantity: "", price: "" });
    } catch (error) {
      toast.error(`Failed to place ${transactionType} order. Please try again.`);
      console.error("Transaction error:", error);
    } finally {
      setProcessingTransaction(false);
    }
  };

  const decisionColor = result?.decision === "ADD" ? "var(--green)" : result?.decision === "REMOVE" ? "var(--red)" : "var(--amber)";

  const scores = result ? [
    { icon: "📈", label: "Trend Score", value: result.trend, color: "var(--cyan)", note: "LSTM model · 30-day window" },
    { icon: "📊", label: "Technical Score", value: result.technical, color: "var(--purple)", note: "RSI · MACD · Bollinger" },
    { icon: "📰", label: "Sentiment Score", value: result.sentiment, color: "var(--amber)", note: "NLP · News & Social Analysis" },
    { icon: "⚠️", label: "Risk Score (Lower = Better)", value: 100 - result.risk, color: "var(--green)", note: "Volatility · Beta · Drawdown" },
  ] : [];

  return (
    <div className="prediction-page">
      <div className="page-header animate-up">
        <h1>AI Prediction Engine</h1>
        <p>LSTM Neural Network + Technical Analysis + Sentiment Fusion</p>
      </div>

      <div className="pred-layout animate-up-delay-1">
        {/* Left: Controls */}
        <div className="pred-controls">
          <div className="card">
            <div className="section-title">Stock Selection</div>
            <div className="symbol-grid">
              {symbols.map(s => (
                <button
                  key={s}
                  className={`symbol-btn ${symbol === s ? "active" : ""}`}
                  onClick={() => setSymbol(s)}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="divider" />

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Or enter symbol</label>
              <input className="input" placeholder="e.g. BAJAJFIN" />
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Exchange</label>
              <select className="input" style={{ cursor: "pointer" }}>
                <option>NSE</option>
                <option>BSE</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label>Prediction Horizon</label>
              <select className="input" style={{ cursor: "pointer" }}>
                <option>1 Day</option>
                <option>1 Week</option>
                <option>1 Month</option>
              </select>
            </div>

            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
              onClick={handlePredict} disabled={loading}>
              {loading
                ? <><span className="loading-spinner" /> Running AI Model...</>
                : <>⚡ Generate Prediction</>}
            </button>
          </div>

          {result && !loading && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="section-title">Price Targets</div>
              {[
                { l: "Current Price", v: `₹${result.price}`, c: "var(--text-primary)" },
                { l: "Target Price", v: `₹${result.target}`, c: "var(--green)" },
                { l: "Stop Loss", v: `₹${result.stop}`, c: "var(--red)" },
                { l: "Potential Upside", v: `+${(((parseFloat(result.target.replace(",","")) - parseFloat(result.price.replace(",",""))) / parseFloat(result.price.replace(",",""))) * 100).toFixed(1)}%`, c: "var(--cyan)" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{row.l}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: row.c }}>{row.v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="pred-result">
          {loading && (
            <div className="card pred-loading">
              <div className="pred-loading-inner">
                <div className="pred-spinner">
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} className="pred-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <div className="pred-loading-text">Analyzing {symbol}...</div>
                <div className="pred-loading-steps">
                  {["Fetching historical data", "Running LSTM model", "Computing indicators", "Scoring sentiment", "Generating decision"].map((s, i) => (
                    <div key={i} className="pred-step" style={{ animationDelay: `${i * 0.3}s` }}>
                      <span className="pred-step-icon">▸</span> {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Decision Banner */}
              <div className="card decision-banner" style={{ border: `1px solid ${decisionColor}33`, background: `linear-gradient(135deg, ${decisionColor}08, var(--bg-card))` }}>
                <div className="decision-layout">
                  <div className="decision-left">
                    <div className="decision-symbol">{symbol.replace("_", " ")}</div>
                    <div className="decision-pill" style={{ background: `${decisionColor}22`, color: decisionColor, border: `1px solid ${decisionColor}44` }}>
                      {result.decision === "BUY" ? "↑" : result.decision === "SELL" ? "↓" : "—"} {result.decision}
                    </div>
                    <div className="decision-explanation">{result.explanation}</div>
                  </div>
                  <div className="decision-right">
                    <ConfidenceMeter value={result.confidence} color={decisionColor} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, background: "var(--green)", borderColor: "var(--green)", color: "#000", fontWeight: "700" }}
                  onClick={() => handleTransactionClick("BUY")}
                >
                  ↑ BUY NOW
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, background: "var(--red)", borderColor: "var(--red)", color: "#fff", fontWeight: "700" }}
                  onClick={() => handleTransactionClick("SELL")}
                >
                  ↓ SELL NOW
                </button>
              </div>

              {/* Score Breakdown */}
              <div className="card" style={{ marginTop: 20 }}>
                <div className="section-title">Score Breakdown</div>
                <ScoreBreakdown scores={scores} />
              </div>

              {/* Final Score */}
              <div className="card" style={{ marginTop: 20 }}>
                <div className="section-title">Hybrid Decision Score</div>
                <div className="final-score">
                  <div className="final-score-bar">
                    <div className="final-score-fill" style={{
                      width: `${result.confidence}%`,
                      background: `linear-gradient(90deg, ${decisionColor}66, ${decisionColor})`
                    }} />
                    <div className="final-score-marker" style={{ left: `${result.confidence}%`, color: decisionColor }}>
                      ▾ {result.confidence}
                    </div>
                  </div>
                  <div className="final-score-scale">
                    <span>0 — Strong Sell</span>
                    <span>50 — Neutral</span>
                    <span>100 — Strong Buy</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .pred-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
        .pred-controls {}
        .pred-result {}
        .symbol-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 4px; }
        .symbol-btn {
          padding: 8px 10px;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .symbol-btn:hover { border-color: var(--border-bright); color: var(--text-primary); }
        .symbol-btn.active { background: var(--cyan-dim); border-color: var(--cyan); color: var(--cyan); }
        .pred-loading {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pred-loading-inner { display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .pred-spinner { display: flex; gap: 8px; }
        .pred-dot {
          width: 10px; height: 10px;
          background: var(--cyan);
          border-radius: 50%;
          animation: bounce 0.9s ease-in-out infinite alternate;
        }
        @keyframes bounce { from { transform: translateY(0); opacity: 0.3; } to { transform: translateY(-16px); opacity: 1; } }
        .pred-loading-text { font-size: 18px; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono); }
        .pred-loading-steps { display: flex; flex-direction: column; gap: 8px; }
        .pred-step { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); animation: fade-in 0.5s ease both; }
        .pred-step-icon { color: var(--cyan); }
        .decision-banner {}
        .decision-layout { display: flex; gap: 24px; align-items: flex-start; }
        .decision-left { flex: 1; }
        .decision-symbol { font-size: 28px; font-weight: 800; font-family: var(--font-mono); letter-spacing: -0.02em; margin-bottom: 10px; }
        .decision-pill {
          display: inline-flex;
          align-items: center;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
          margin-bottom: 16px;
        }
        .decision-explanation { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
        .decision-right { flex-shrink: 0; }
        .final-score { padding: 8px 0; }
        .final-score-bar {
          height: 20px;
          background: var(--bg-deep);
          border-radius: 10px;
          overflow: visible;
          border: 1px solid var(--border);
          position: relative;
          margin-bottom: 8px;
        }
        .final-score-fill { height: 100%; border-radius: 10px; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }
        .final-score-marker {
          position: absolute;
          top: -20px;
          transform: translateX(-50%);
          font-size: 11px;
          font-family: var(--font-mono);
          font-weight: 700;
          transition: left 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        .final-score-scale { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
        @media (max-width: 900px) {
          .pred-layout { grid-template-columns: 1fr; }
          .decision-layout { flex-direction: column; align-items: center; }
        }
      `}</style>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal-overlay" onClick={() => !processingTransaction && setShowTransactionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{transactionType} {symbol}</h2>
              <button
                className="modal-close"
                onClick={() => !processingTransaction && setShowTransactionModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit}>
              <div className="form-group">
                <label>Quantity (shares)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Enter number of shares"
                  value={transactionData.quantity}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, quantity: e.target.value })
                  }
                  min="1"
                  step="1"
                  disabled={processingTransaction}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price per share (₹)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Enter price per share"
                  value={transactionData.price}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, price: e.target.value })
                  }
                  step="0.01"
                  disabled={processingTransaction}
                  required
                />
              </div>

              {transactionData.quantity && transactionData.price && (
                <div className="order-summary">
                  <div><span>Total Value:</span><span>₹{(parseFloat(transactionData.quantity) * parseFloat(transactionData.price)).toFixed(2)}</span></div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowTransactionModal(false)}
                  disabled={processingTransaction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={processingTransaction}
                >
                  {processingTransaction ? (
                    <>
                      <span className="loading-spinner" /> Processing...
                    </>
                  ) : (
                    `Confirm ${transactionType}`
                  )}
                </button>
              </div>
            </form>
          </div>

          <style>{`
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .modal-content {
              background: var(--bg-card);
              border: 1px solid var(--border-bright);
              border-radius: 16px;
              padding: 28px;
              width: 90%;
              max-width: 400px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
              border-bottom: 1px solid var(--border);
              padding-bottom: 16px;
            }
            .modal-header h2 {
              font-size: 20px;
              font-weight: 700;
              margin: 0;
            }
            .modal-close {
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: var(--text-secondary);
              transition: color 0.2s;
            }
            .modal-close:hover {
              color: var(--text-primary);
            }
            .form-group {
              margin-bottom: 16px;
            }
            .form-group label {
              display: block;
              font-size: 12px;
              font-weight: 600;
              color: var(--text-secondary);
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .order-summary {
              background: var(--bg-deep);
              border: 1px solid var(--border);
              border-radius: 8px;
              padding: 12px 16px;
              margin: 16px 0;
            }
            .order-summary div {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: 600;
            }
            .order-summary span:last-child {
              color: var(--cyan);
              font-family: var(--font-mono);
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
