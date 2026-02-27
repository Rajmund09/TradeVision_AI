def risk_score(latest):

    score = 0
    explanation = []

    if latest["atr"] / latest["Close"] < 0.03:
        score += 10
        explanation.append("Low volatility (stable)")
    else:
        score -= 5
        explanation.append("High volatility risk")

    return score, explanation
