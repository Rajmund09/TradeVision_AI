import { useState } from "react";

export default function AlertModal({ onClose, onCreate }) {
  const [symbol, setSymbol] = useState("");
  const [threshold, setThreshold] = useState("");
  const [direction, setDirection] = useState("above");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symbol || !threshold) return;
    onCreate({ symbol: symbol.toUpperCase(), threshold: parseFloat(threshold), direction });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        <h2>New Alert</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Symbol</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. RELIANCE"
            />
          </div>
          <div className="form-group">
            <label>Threshold</label>
            <input
              type="number"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Direction</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
      <style>{` 
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
        }
        .alert-modal {
          background: var(--bg-card);
          padding: 24px;
          border-radius: 12px;
          width: 320px;
        }
        .alert-modal h2 { margin-top: 0; }
        .form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
        .form-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
        .form-group input,
        .form-group select { padding: 8px; border: 1px solid var(--border); border-radius: 6px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
      `}</style>
    </div>
  );
}