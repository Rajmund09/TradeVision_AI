export default function RiskMeter({ value = 42, label = "Overall Risk" }) {
  const color = value <= 35 ? "var(--green)" : value <= 60 ? "var(--amber)" : "var(--red)";
  const riskLabel = value <= 35 ? "LOW RISK" : value <= 60 ? "MODERATE" : "HIGH RISK";

  const dash = 2 * Math.PI * 40;
  const offset = dash * (1 - value / 100);

  return (
    <div className="risk-meter">
      <div className="risk-ring">
        <svg viewBox="0 0 100 100" width="110" height="110">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="risk-inner">
          <div className="risk-val" style={{ color }}>{value}</div>
          <div className="risk-lbl">{riskLabel}</div>
        </div>
      </div>

      <style>{`
        .risk-meter { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .risk-ring { position: relative; }
        .risk-inner {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        .risk-val { font-family: var(--font-mono); font-size: 22px; font-weight: 800; line-height: 1; }
        .risk-lbl { font-size: 8px; font-weight: 700; letter-spacing: 0.12em; color: var(--text-muted); font-family: var(--font-mono); }
      `}</style>
    </div>
  );
}
