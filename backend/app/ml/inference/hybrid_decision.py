"""
Hybrid decision engine combining multiple scoring signals.
Weighted logic integrating technical, trend, sentiment, pattern, and risk scores
with confidence percentage calculation.
"""

from ..scoring_engine.technical_score import technical_score
from ..scoring_engine.trend_score import trend_score
from ..scoring_engine.sentiment_score import sentiment_score
from ..scoring_engine.pattern_score import pattern_score
from ..scoring_engine.risk_score import risk_score


def make_hybrid_decision(df, latest, lstm_prob=None):
    """
    Compute final trading decision by combining five independent scoring signals
    using weighted average logic.

    Args:
        df: DataFrame with OHLCV + technical features
        latest: dict with current row data (latest price bar)
        lstm_prob: optional neural network trend probability [0,1]

    Returns:
        dict with keys:
        - decision: str ("Strong Buy", "Buy", "Hold", "Avoid")
        - confidence: float (0-100) = strength of conviction
        - final_score: float (0-100) = normalized composite score
        - components: dict with individual component scores and weights
        - explanation: list of reasoning strings
    """

    # Component 1: Technical Indicators
    tech_raw, tech_exp = technical_score(latest)

    # Component 2: Trend Analysis
    trend_raw, trend_exp = trend_score(latest)

    # Component 3: Sentiment
    sentiment_raw, sentiment_exp = sentiment_score(latest)

    # Component 4: Pattern Recognition
    pattern_raw, pattern_exp = pattern_score(df)

    # Component 5: Risk Assessment
    risk_raw, risk_exp = risk_score(latest)

    # Define weights for each component (must sum to 1.0)
    # Technical indicators are most reliable; risk is a constraint
    weights = {
        "technical": 0.35,  # Core technical signals
        "trend": 0.25,      # Trend strength
        "lstm": 0.15,       # Neural network consensus
        "pattern": 0.15,    # Pattern confirmation
        "sentiment": 0.10,  # Market sentiment
    }

    # Normalize component raw scores to 0-100 range.
    # Raw scores are typically constrained by their individual logic;
    # we apply an offset to move them into [0, 100] range.
    tech_normalized = min(100, max(0, 50 + tech_raw))
    trend_normalized = min(100, max(0, 50 + trend_raw))
    sentiment_normalized = min(100, max(0, 50 + sentiment_raw))
    pattern_normalized = min(100, max(0, 50 + pattern_raw))
    risk_normalized = min(100, max(0, 50 + risk_raw))

    # Apply LSTM probability if available
    lstm_normalized = 100 * lstm_prob if lstm_prob is not None else 50

    # Compute weighted average
    final_score = (
        weights["technical"] * tech_normalized
        + weights["trend"] * trend_normalized
        + weights["sentiment"] * sentiment_normalized
        + weights["pattern"] * pattern_normalized
        + weights["lstm"] * lstm_normalized
    )

    # Risk is not directly weighted into final score; instead it modulates confidence
    risk_adjustment = (risk_normalized - 50) / 50  # -1 to +1 scale
    confidence = max(0, min(100, abs(final_score - 50) * 1.5 + 25))
    confidence = confidence * (1 + risk_adjustment * 0.3)  # Risk slightly adjusts confidence
    confidence = max(0, min(100, confidence))

    # Decision thresholds (on 0-100 scale)
    if final_score >= 75:
        decision = "Strong Buy"
    elif final_score >= 60:
        decision = "Buy"
    elif final_score >= 40:
        decision = "Hold"
    else:
        decision = "Avoid"

    # Compile component details
    components = {
        "technical": {"score": round(tech_normalized, 2), "weight": weights["technical"]},
        "trend": {"score": round(trend_normalized, 2), "weight": weights["trend"]},
        "sentiment": {"score": round(sentiment_normalized, 2), "weight": weights["sentiment"]},
        "pattern": {"score": round(pattern_normalized, 2), "weight": weights["pattern"]},
        "lstm": {"score": round(lstm_normalized, 2), "weight": weights["lstm"]},
        "risk": {"score": round(risk_normalized, 2), "weight": 0.0},  # modulates confidence
    }

    # Aggregate explanations
    explanation = (
        tech_exp + trend_exp + sentiment_exp + pattern_exp + risk_exp
    )

    return {
        "decision": decision,
        "confidence": round(confidence, 2),
        "final_score": round(final_score, 2),
        "components": components,
        "explanation": explanation,
    }

