"""
CRUD helpers for user portfolios.
"""

from typing import List
from sqlalchemy.orm import Session

from ..models import Portfolio


def get_portfolio(db: Session, user_id: int) -> List[Portfolio]:
    """Return all positions owned by ``user_id``."""
    return db.query(Portfolio).filter(Portfolio.user_id == user_id).all()


def add_position(
    db: Session,
    user_id: int,
    symbol: str,
    quantity: float,
    buy_price: float,
) -> Portfolio:
    """Add a new position to the portfolio."""
    position = Portfolio(
        user_id=user_id,
        symbol=symbol,
        quantity=quantity,
        buy_price=buy_price,
    )
    db.add(position)
    db.commit()
    db.refresh(position)
    return position


def update_position(
    db: Session,
    position_id: int,
    **changes,
) -> Portfolio:
    """Apply ``changes`` to an existing position and return it."""
    pos = db.query(Portfolio).get(position_id)
    if not pos:
        return None
    for key, val in changes.items():
        setattr(pos, key, val)
    db.commit()
    db.refresh(pos)
    return pos


def remove_position(db: Session, position_id: int) -> bool:
    """Delete the specified position. Returns ``True`` if removed."""
    pos = db.query(Portfolio).get(position_id)
    if not pos:
        return False
    db.delete(pos)
    db.commit()
    return True
