from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from .. import database
from ..models import Alert, User
from ..auth.jwt_handler import get_current_user
from ..services import alert_service

router = APIRouter(prefix="/alerts", tags=["alerts"])


class AlertItem(BaseModel):
    id: int
    symbol: str
    threshold: float
    direction: str

    class Config:
        orm_mode = True


@router.get("/", response_model=List[AlertItem])
async def list_alerts(
    db: Session = Depends(database.get_db),
    current_user: str = Depends(get_current_user),
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    alerts = alert_service.list_alerts(db, user.id)
    return [AlertItem(id=a.id, symbol=a.symbol, threshold=a.threshold, direction=a.direction) for a in alerts]


@router.post("/")
async def create_alert(
    item: AlertItem,
    db: Session = Depends(database.get_db),
    current_user: str = Depends(get_current_user),
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    a = alert_service.create_alert(db, user.id, item.symbol, item.threshold, item.direction)
    return {"status": "created", "alert": {"id": a.id, "symbol": a.symbol, "threshold": a.threshold, "direction": a.direction}}


@router.delete("/{alert_id}")
async def remove_alert(
    alert_id: int,
    db: Session = Depends(database.get_db),
    current_user: str = Depends(get_current_user),
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    success = alert_service.delete_alert(db, alert_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "deleted", "id": alert_id}
