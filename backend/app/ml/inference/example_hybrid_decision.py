"""
Example usage of the hybrid decision engine.
Demonstrates how to combine all scoring modules with LSTM predictions.
"""


def example_usage():
    """Example: how to call the hybrid decision function"""
    import pandas as pd
    
    # Load your price data
    df = pd.read_csv("data/prices/INFY.csv")
    
    # Build features (RSI, EMA, MACD, ATR, Bollinger Bands, etc.)
    from app.ml.data_pipeline.feature_engineering import build_features
    df = build_features(df)
    
    # Get the latest row
    latest = df.iloc[-1]
    
    # Optional: get LSTM trend probability
    from app.ml.model.lstm_predict import predict_lstm
    lstm_prob = predict_lstm(df)
    
    # Make hybrid decision with all 5 components
    from app.ml.inference.hybrid_decision import make_hybrid_decision
    result = make_hybrid_decision(df, latest, lstm_prob=lstm_prob)
    
    # Output
    print(f"Decision: {result['decision']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Final Score: {result['final_score']}/100")
    print("\nComponent Scores:")
    for name, comp_data in result['components'].items():
        score = comp_data['score']
        weight = comp_data['weight']
        print(f"  {name:12s}: {score:6.2f}/100 (weight: {weight:.0%})")
    
    print("\nExplanation:")
    for line in result['explanation']:
        print(f"  • {line}")
    
    return result


if __name__ == "__main__":
    result = example_usage()
