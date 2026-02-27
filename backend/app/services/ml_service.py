"""
High‑level functions that wrap training and inference routines.
"""

from typing import Any


def train_model(symbol: str, **kwargs) -> str:
    """Train a model identified by ``symbol``.

    ``kwargs`` can contain hyperparameters.  The actual training logic is
    located under ``app/ml/training``; this function simply exposes a
    convenient call site for route handlers or CLI tools.
    """
    raise NotImplementedError("Model training has not been wired up yet")


def predict(symbol: str, input_data: Any) -> Any:
    """Perform inference for ``symbol`` using the selected model.

    The default implementation forwards to the LSTM predictor.  Additional
    strategies (CNN, hybrid, etc.) can be dispatched based on configuration
    or arguments.
    """
    from ..inference.lstm_predict import predict as lstm_predict

    return lstm_predict(symbol, input_data)
