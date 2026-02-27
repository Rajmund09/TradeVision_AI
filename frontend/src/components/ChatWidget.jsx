export default function ChatWidget({ messages, input, setInput, onSend, loading }) {
  return (
    <div className="chat-widget">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-bubble">
              {m.role === "assistant" && <div className="chat-ai-icon">◈</div>}
              <div className="chat-text">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <div className="chat-bubble">
              <div className="chat-ai-icon">◈</div>
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input-row">
        <input
          className="input"
          placeholder="Ask AI about market strategy, risk, stocks..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
          disabled={loading}
        />
        <button className="btn btn-primary chat-send" onClick={onSend} disabled={loading || !input.trim()}>
          {loading ? <span className="loading-spinner" /> : "▶"}
        </button>
      </div>

      <style>{`
        .chat-widget { display: flex; flex-direction: column; height: 100%; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; min-height: 400px; max-height: 500px; }
        .chat-msg { display: flex; }
        .chat-msg.user { justify-content: flex-end; }
        .chat-msg.assistant { justify-content: flex-start; }
        .chat-bubble {
          max-width: 80%;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .chat-msg.user .chat-bubble {
          flex-direction: row-reverse;
        }
        .chat-ai-icon {
          width: 28px; height: 28px;
          background: var(--cyan-dim);
          border: 1px solid var(--border-bright);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cyan);
          font-size: 13px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .chat-text {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.6;
        }
        .chat-msg.user .chat-text {
          background: var(--cyan-dim);
          border: 1px solid var(--border-bright);
          color: var(--text-primary);
          border-top-right-radius: 4px;
        }
        .chat-msg.assistant .chat-text {
          background: var(--bg-deep);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-top-left-radius: 4px;
          white-space: pre-wrap;
        }
        .chat-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          border-radius: 12px;
          border-top-left-radius: 4px;
        }
        .chat-typing span {
          width: 6px; height: 6px;
          background: var(--cyan);
          border-radius: 50%;
          animation: bounce 0.8s ease-in-out infinite alternate;
        }
        .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
        .chat-input-row { display: flex; gap: 10px; padding: 16px; border-top: 1px solid var(--border); }
        .chat-send { padding: 12px 16px; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
