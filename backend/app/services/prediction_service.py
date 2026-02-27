"""
Persistence helpers for prediction history.
"""

from typing import List
from sqlalchemy.orm import Session

from ..models import Prediction


def record_prediction(
    db: Session,
    symbol: str,
    decision: str,
    score: float,
    **extra,
) -> Prediction:
    """Create a new ``Prediction`` row and return it.

    ``extra`` is passed through so callers can save technical/sequence
    scores, confidence, etc.
    """
    pred = Prediction(symbol=symbol, decision=decision, score=score, **extra)
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred


def get_recent(db: Session, symbol: str, limit: int = 10) -> List[Prediction]:
    """Return the most recent ``limit`` predictions for ``symbol``. """
    return (
        db.query(Prediction)
        .filter(Prediction.symbol == symbol)
        .order_by(Prediction.timestamp.desc())
        .limit(limit)
        .all()
    )
