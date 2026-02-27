import pandas as pd
import numpy as np
from ..indicators.indicators import (
    compute_rsi, compute_ema, compute_macd, compute_atr,
    compute_momentum, compute_trend_slope
)


def build_features(df):
    """Build all features from raw OHLCV data"""
    df = df.copy()

    df["rsi"] = compute_rsi(df["Close"])
    df["ema20"] = compute_ema(df["Close"], 20)
    df["ema50"] = compute_ema(df["Close"], 50)
    df["macd"] = compute_macd(df["Close"])
    df["atr"] = compute_atr(df)
    df["momentum_5"] = compute_momentum(df["Close"], 5)
    df["momentum_20"] = compute_momentum(df["Close"], 20)
    df["trend_slope"] = compute_trend_slope(df["Close"], 10)

    df["ema_diff"] = df["ema20"] - df["ema50"]
    df["volume_change"] = df["Volume"].pct_change()

    df = df.dropna()

    return df
