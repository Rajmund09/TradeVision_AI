from .technical_score import technical_score
from .trend_score import trend_score
from .risk_score import risk_score


def calculate_final_score(latest):

    tech, exp1 = technical_score(latest)
    trend, exp2 = trend_score(latest)
    risk, exp3 = risk_score(latest)

    total_score = tech + trend + risk

    # Normalize to 0–100
    final = max(0, min(100, 50 + total_score))

    explanation = exp1 + exp2 + exp3

    if final >= 75:
        decision = "Strong Buy"
    elif final >= 60:
        decision = "Buy"
    elif final >= 45:
        decision = "Hold"
    else:
        decision = "Avoid"

    return final, decision, explanation
