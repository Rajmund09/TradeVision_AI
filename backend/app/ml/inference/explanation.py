# Explanation engine - provides human-readable reasoning
def generate_explanation(technical_indicators, lstm_signal, final_decision):
    """Generate human-readable explanation for the prediction"""
    
    explanations = []
    
    # Technical analysis explanation
    if technical_indicators.get('rsi'):
        rsi = technical_indicators['rsi']
        if rsi < 30:
            explanations.append("📊 RSI shows oversold conditions (bullish)")
        elif rsi > 70:
            explanations.append("📊 RSI shows overbought conditions (bearish)")
    
    # EMA explanation
    if technical_indicators.get('ema_diff'):
        ema_diff = technical_indicators['ema_diff']
        if ema_diff > 0:
            explanations.append("📈 EMA 20 above EMA 50 - Uptrend confirmed")
        else:
            explanations.append("📉 EMA 20 below EMA 50 - Downtrend confirmed")
    
    # MACD explanation
    if technical_indicators.get('macd'):
        macd = technical_indicators['macd']
        if macd > 0:
            explanations.append("➡️ MACD is positive - Bullish momentum")
        else:
            explanations.append("➡️ MACD is negative - Bearish momentum")
    
    # LSTM signal
    if lstm_signal > 0.55:
        explanations.append("🤖 LSTM model predicts upward trend")
    elif lstm_signal < 0.45:
        explanations.append("🤖 LSTM model predicts downward trend")
    else:
        explanations.append("🤖 LSTM model shows uncertainty")
    
    # Final decision summary
    explanations.append(f"✅ Final Decision: {final_decision}")
    
    return explanations
