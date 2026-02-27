import pandas as pd
import numpy as np


# ----------------------------
# TECHNICAL INDICATORS
# ----------------------------

def compute_rsi(series, period=14):
    """Compute Relative Strength Index"""
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(period).mean()
    avg_loss = loss.rolling(period).mean()

    rs = avg_gain / (avg_loss + 1e-10)
    return 100 - (100 / (1 + rs))


def compute_ema(series, span):
    """Compute Exponential Moving Average"""
    return series.ewm(span=span, adjust=False).mean()


def compute_macd(series):
    """Compute MACD (Moving Average Convergence Divergence)"""
    ema12 = compute_ema(series, 12)
    ema26 = compute_ema(series, 26)
    return ema12 - ema26


def compute_atr(df, period=14):
    """Compute Average True Range"""
    high_low = df["High"] - df["Low"]
    high_close = np.abs(df["High"] - df["Close"].shift())
    low_close = np.abs(df["Low"] - df["Close"].shift())

    tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    return tr.rolling(period).mean()


def compute_momentum(series, period=5):
    """Compute Momentum indicator"""
    return series.pct_change(period)


def compute_trend_slope(series, window=10):
    """Compute Trend Slope using polynomial fitting"""
    return series.rolling(window).apply(
        lambda x: np.polyfit(range(len(x)), x, 1)[0],
        raw=False
    )


def compute_bollinger_bands(series, period=20, std_dev=2):
    """Compute Bollinger Bands"""
    sma = series.rolling(period).mean()
    std = series.rolling(period).std()
    upper = sma + (std_dev * std)
    lower = sma - (std_dev * std)
    return upper, sma, lower


def compute_stochastic(df, period=14):
    """Compute Stochastic Oscillator"""
    low_min = df["Low"].rolling(period).min()
    high_max = df["High"].rolling(period).max()
    k = 100 * ((df["Close"] - low_min) / (high_max - low_min))
    d = k.rolling(3).mean()
    return k, d
