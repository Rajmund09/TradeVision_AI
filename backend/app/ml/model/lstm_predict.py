import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from pathlib import Path
import pickle

# Lazy import tensorflow - will only load when actually needed
tf = None


REPO_ROOT = Path(__file__).resolve().parents[4]
MODEL_PATH = REPO_ROOT / "models" / "lstm" / "lstm_trend_model.keras"
SCALER_PATH = REPO_ROOT / "models" / "scaler.pkl"
SEQUENCE_LENGTH = 60

# Lazy-load model/scaler to avoid startup cost
_model = None
_scaler = None


def _load_model():
    """Load LSTM model from disk (lazy loading)"""
    global _model, tf
    
    # Lazy import tensorflow only when needed
    if tf is None:
        try:
            import tensorflow as tf
        except ImportError:
            # TensorFlow not available, return None
            return None
            
    if _model is None:
        if MODEL_PATH.exists():
            _model = tf.keras.models.load_model(str(MODEL_PATH))
        else:
            # Return None if model doesn't exist yet
            return None
    return _model


def _load_scaler():
    """Load preprocessing scaler from disk (pickle)"""
    global _scaler
    if _scaler is None:
        if SCALER_PATH.exists():
            with open(SCALER_PATH, "rb") as f:
                _scaler = pickle.load(f)
        else:
            # scaler not available; predictions will fit a fresh one
            return None
    return _scaler


def predict_lstm(df):
    """Predict trend probability using LSTM model"""

    for col in ["Open", "High", "Low", "Close", "Volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna()

    if len(df) < SEQUENCE_LENGTH:
        return 0.5  # Neutral probability if insufficient data

    features = df[["Open", "High", "Low", "Close", "Volume"]].values

    # attempt to reuse the scaler that was saved during training
    scaler = _load_scaler()
    if scaler is None:
        # fall back to fresh scaler - this will not match training distribution
        scaler = MinMaxScaler()
        features = scaler.fit_transform(features)
    else:
        # apply the pre‑fitted transformation (do NOT re-fit)
        features = scaler.transform(features)

    last_sequence = features[-SEQUENCE_LENGTH:]
    last_sequence = np.expand_dims(last_sequence, axis=0)

    model = _load_model()
    if model is None:
        return 0.5  # Return neutral if model not available
    
    prob = model.predict(last_sequence)[0][0]

    # ensure a python float between 0 and 1
    return float(np.clip(prob, 0.0, 1.0))
