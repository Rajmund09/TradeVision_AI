import '../styles/components.css'

export const StockCard = ({ prediction }) => {
  const getDecisionColor = (decision) => {
    if (decision.includes('Strong Buy')) return '#2ecc71'
    if (decision.includes('Buy')) return '#27ae60'
    if (decision.includes('Hold')) return '#f39c12'
    return '#e74c3c'
  }


  return (
    <div className="stock-card">
      <div className="card-header">
        <h2>{prediction.symbol}</h2>
        <span className="price">₹ {prediction.latest_price}</span>
      </div>
      <div className="card-body">
        <div className="decision" style={{ borderColor: getDecisionColor(prediction.decision) }}>
          <h3>{prediction.decision}</h3>
          <p className="score">Score: {prediction.score}/100</p>
        </div>
        <div className="metrics">
          <div className="metric">
            <label>Technical</label>
            <span>{prediction.technical_score?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="metric">
            <label>LSTM</label>
            <span>{prediction.lstm_probability?.toFixed(2) || 'N/A'}</span>
          </div>
        </div>
        {prediction.explanation && (
          <div className="explanation">
            {Array.isArray(prediction.explanation) && prediction.explanation.map((exp, idx) => (
              <p key={idx}>✓ {exp}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
