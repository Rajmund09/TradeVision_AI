export default function ConfidenceMeter({ value = 75, label = "AI Confidence", color }) {
  const col = color || (value >= 70 ? "var(--green)" : value >= 45 ? "var(--amber)" : "var(--red)");
  const dash = 2 * Math.PI * 54;
  const offset = dash * (1 - value / 100);

  return (
    <div className="conf-meter">
      <div className="conf-ring">
        <svg viewBox="0 0 120 120" width="140" height="140">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={col} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.3s" }}
          />
          <circle cx="60" cy="60" r="46" fill="none" stroke={col} strokeWidth="0.5" opacity="0.3" />
        </svg>
        <div className="conf-inner">
          <div className="conf-value" style={{ color: col }}>{value}<span>%</span></div>
          <div className="conf-grade">{value >= 80 ? "HIGH" : value >= 55 ? "MED" : "LOW"}</div>
        </div>
      </div>
      <div className="conf-label">{label}</div>

      <style>{`
        .conf-meter { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .conf-ring { position: relative; }
        .conf-inner {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .conf-value {
          font-size: 30px;
          font-weight: 800;
          font-family: var(--font-mono);
          line-height: 1;
        }
        .conf-value span { font-size: 14px; opacity: 0.7; }
        .conf-grade {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--text-muted);
          font-family: var(--font-mono);
          margin-top: 2px;
        }
        .conf-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}
