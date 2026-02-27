export default function AlertBanner({ message, onClose }) {
  return (
    <div className="alert-banner">
      <span className="alert-msg">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">✕</button>
      )}
      <style>{`
        .alert-banner {
          background: var(--red-dim);
          color: var(--red);
          padding: 12px 16px;
          border: 1px solid var(--red);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .alert-close {
          background: transparent;
          border: none;
          color: inherit;
          font-size: 16px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}