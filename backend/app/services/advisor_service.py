"""
Business logic for generating trading advice from score data.
"""

from typing import Dict, Any


def generate_advice(scores: Dict[str, float]) -> str:
    """Return a simple BUY/SELL/HOLD string based on provided scores.

    ``scores`` is expected to include a ``final`` key but any set of
    metrics may be provided.  This logic can be replaced with a more
    sophisticated ensemble or a call to an external advisor service.
    """
    final = scores.get("final", 0.0)
    if final > 0.5:
        return "BUY"
    elif final < -0.5:
        return "SELL"
    else:
        return "HOLD"
