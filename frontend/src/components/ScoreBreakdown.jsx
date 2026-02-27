export default function ScoreBreakdown({ scores }) {
  return (
    <div className="score-breakdown">
      {scores.map((s, i) => (
        <div key={i} className="score-item">
          <div className="score-item-header">
            <span className="score-item-icon">{s.icon}</span>
            <span className="score-item-label">{s.label}</span>
            <span className="score-item-value" style={{ color: s.color }}>{s.value}/100</span>
          </div>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{
              width: `${s.value}%`,
              background: `linear-gradient(90deg, ${s.color}88, ${s.color})`
            }} />
          </div>
          <div className="score-item-note">{s.note}</div>
        </div>
      ))}

      <style>{`
        .score-breakdown { display: flex; flex-direction: column; gap: 16px; }
        .score-item {}
        .score-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .score-item-icon { font-size: 14px; }
        .score-item-label {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .score-item-value {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
        }
        .score-item-note {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
