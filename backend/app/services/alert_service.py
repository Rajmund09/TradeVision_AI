"""
Placeholder business logic for price/notification alerts.
The database schema for alerts hasn't been defined yet; this module
provides the API surface and can be fleshed out later.
"""

from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from ..models import Alert


def create_alert(
    db: Session,
    user_id: int,
    symbol: str,
    threshold: float,
    direction: str,
) -> Alert:
    """Persist a new Alert row and return it."""
    alert = Alert(
        user_id=user_id,
        symbol=symbol.upper(),
        threshold=threshold,
        direction=direction,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def list_alerts(db: Session, user_id: int) -> List[Alert]:
    """Return all alerts for the given user."""
    return db.query(Alert).filter(Alert.user_id == user_id).all()


def delete_alert(db: Session, alert_id: int, user_id: Optional[int] = None) -> bool:
    """Remove an alert by id.  If ``user_id`` provided, ensure it matches."""
    q = db.query(Alert).filter(Alert.id == alert_id)
    if user_id is not None:
        q = q.filter(Alert.user_id == user_id)
    alert = q.first()
    if not alert:
        return False
    db.delete(alert)
    db.commit()
    return True
