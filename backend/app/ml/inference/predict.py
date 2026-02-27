import pandas as pd
import os
from pathlib import Path

from ..data_pipeline.feature_engineering import build_features
from ..scoring_engine.final_score import calculate_final_score
from ..model.lstm_predict import predict_lstm


REPO_ROOT = Path(__file__).resolve().parents[4]
DATA_PATH = REPO_ROOT / "data" / "prices"


def predict_stock(symbol):
    """Main prediction endpoint - returns trading decision and confidence"""

    clean_symbol = symbol.replace(".NS", "")
    file_path = DATA_PATH / f"{clean_symbol}.csv"

    if not file_path.exists():
        return None

    df = pd.read_csv(file_path)

    for col in ["Open", "High", "Low", "Close", "Volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna()

    # Build technical features
    df = build_features(df)

    if df.empty:
        return None

    latest = df.iloc[-1]

    # Calculate technical score
    indicator_score, decision, explanation = calculate_final_score(latest)

    # Get LSTM probability
    lstm_prob = predict_lstm(df)
    lstm_score = lstm_prob * 100

    # Calculate target and stop loss
    target_price = latest["Close"] * 1.05  # Example: 5% above the current price
    stop_loss = latest["Close"] * 0.95  # Example: 5% below the current price

    # Hybrid final score (60% technical, 40% LSTM)
    final_score = (indicator_score * 0.6) + (lstm_score * 0.4)

    # Determine final decision
    if final_score >= 75:
        final_decision = "Strong Buy"
    elif final_score >= 50:
        final_decision = "Buy"
    elif final_score >= 25:
        final_decision = "Hold"
    else:
        final_decision = "Avoid"

    result = {
        "symbol": symbol,
        "decision": final_decision,
        "score": final_score,
        "technical_score": indicator_score,
        "lstm_probability": lstm_score,
        "latest_price": latest["Close"],
        "target": target_price,
        "stop": stop_loss,
        "explanation": explanation,
    }

    return result
