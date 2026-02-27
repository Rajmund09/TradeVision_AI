def technical_score(latest):

    score = 0
    explanation = []

    # RSI
    if latest["rsi"] < 30:
        score += 20
        explanation.append("RSI indicates oversold (bullish)")
    elif latest["rsi"] > 70:
        score -= 15
        explanation.append("RSI indicates overbought (bearish)")
    else:
        score += 5

    # EMA crossover
    if latest["ema_diff"] > 0:
        score += 20
        explanation.append("EMA20 above EMA50 (uptrend)")
    else:
        score -= 10
        explanation.append("EMA20 below EMA50 (downtrend)")

    # MACD
    if latest["macd"] > 0:
        score += 15
        explanation.append("MACD positive (momentum bullish)")
    else:
        score -= 10
        explanation.append("MACD negative")

    return score, explanation
