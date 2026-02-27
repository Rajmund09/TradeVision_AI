"""
Candlestick pattern recognition scoring.
Identifies bullish/bearish patterns from recent price action.
"""


def pattern_score(df):
    """
    Analyze candlestick patterns from the last few periods.
    
    Returns:
        tuple: (score: int, explanation: list)
        Score range: -25 to +25
    """
    score = 0
    explanation = []

    if len(df) < 3:
        explanation.append("Insufficient data for pattern analysis")
        return score, explanation

    # Extract recent candles (last 3)
    recent = df.tail(3).reset_index(drop=True)

    # Current (most recent) candle
    current = recent.iloc[-1]
    prev_close = recent.iloc[-2]["Close"]

    body = current["Close"] - current["Open"]
    body_height = abs(body)
    total_range = current["High"] - current["Low"]

    # Normalize body relative to total range
    body_ratio = body_height / total_range if total_range > 0 else 0

    # Hammer pattern (small body, long lower wick)
    if total_range > 0:
        lower_wick = current["Open"] - current["Low"] if current["Open"] < current["Close"] else current["Close"] - current["Low"]
        lower_wick_ratio = lower_wick / total_range if total_range > 0 else 0

        if lower_wick_ratio > 0.6 and body_ratio < 0.3 and current["Close"] > prev_close:
            score += 20
            explanation.append("Hammer pattern (potential reversal)")

    # Engulfing pattern (current candle engulfs previous)
    if len(recent) >= 2:
        prev = recent.iloc[-2]
        prev_body = abs(prev["Close"] - prev["Open"])

        if body > 1.3 * prev_body and current["Close"] > prev["Open"]:
            score += 15
            explanation.append("Bullish engulfing pattern")
        elif body < -1.3 * prev_body and current["Close"] < prev["Open"]:
            score -= 15
            explanation.append("Bearish engulfing pattern")

    # Doji-like pattern (small body, balanced wicks)
    if body_ratio < 0.15:
        upper_wick = current["High"] - max(current["Open"], current["Close"])
        lower_wick = min(current["Open"], current["Close"]) - current["Low"]

        if abs(upper_wick - lower_wick) < 0.005 * current["Close"]:
            score += 10
            explanation.append("Doji pattern (indecision)")

    # Three white soldiers / three black crows
    if len(recent) >= 3:
        all_bullish = all(recent[i]["Close"] > recent[i]["Open"] for i in range(3))
        if all_bullish:
            if recent.iloc[2]["Close"] > recent.iloc[1]["Close"] > recent.iloc[0]["Close"]:
                score += 20
                explanation.append("Three white soldiers (strong uptrend)")

    if not explanation or (score == 0 and not explanation):
        explanation.append("No significant patterns detected")

    return score, explanation
