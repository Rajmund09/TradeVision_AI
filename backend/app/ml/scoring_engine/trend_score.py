def trend_score(latest):

    score = 0
    explanation = []

    if latest["trend_slope"] > 0:
        score += 20
        explanation.append("Trend slope positive")
    else:
        score -= 10
        explanation.append("Trend slope negative")

    if latest["momentum_20"] > 0:
        score += 15
        explanation.append("20-day momentum positive")

    return score, explanation
