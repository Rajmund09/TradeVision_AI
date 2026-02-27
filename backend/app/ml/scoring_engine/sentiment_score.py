"""
Sentiment and market condition scoring.
Evaluates overall market sentiment from price action and volatility.
"""


def sentiment_score(latest):
    """
    Assess market sentiment based on price volatility,
    volume trends, and technical oscillators.

    Returns:
        tuple: (score: int, explanation: list)
        Score range: -20 to +20
    """
    score = 0
    explanation = []

    # Volume sentiment
    if "volume_ma_ratio" in latest:
        vol_ratio = latest.get("volume_ma_ratio", 1.0)
        if vol_ratio > 1.3:
            score += 10
            explanation.append("Strong volume (bullish sentiment)")
        elif vol_ratio < 0.7:
            score -= 8
            explanation.append("Weak volume (bearish sentiment)")

    # Volatility-adjusted sentiment
    if "volatility" in latest:
        vol = latest["volatility"]
        if vol < 0.015:  # low volatility
            score += 5
            explanation.append("Low volatility (stable sentiment)")
        elif vol > 0.04:  # high volatility
            score -= 5
            explanation.append("High volatility (uncertain sentiment)")

    # RSI sentiment (extreme conditions)
    if "rsi" in latest:
        rsi = latest["rsi"]
        if rsi > 80:
            score -= 8
            explanation.append("Oversold extreme (bearish reversal risk)")
        elif rsi < 20:
            score += 8
            explanation.append("Underbought extreme (bullish reversal potential)")

    if not explanation:
        explanation.append("Neutral sentiment")

    return score, explanation
