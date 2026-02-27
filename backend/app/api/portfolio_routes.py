# Portfolio routes
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from .. import database
from ..models import Portfolio, User
from ..auth.jwt_handler import get_current_user
from ..utils.helpers import calculate_portfolio_risk

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


# --------------------
# redirect endpoint to avoid trailing slash issues
# --------------------

@router.get("")
async def redirect_to_portfolio():
    """Redirect /portfolio to /portfolio/ to avoid 307 redirect issues."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/api/portfolio/", status_code=307)


# --------------------
# request/response schemas
# --------------------

class PortfolioItem(BaseModel):
    symbol: str
    quantity: float
    buy_price: float


class RiskAnalysis(BaseModel):
    diversification_score: float
    volatility_risk: float
    allocation_imbalance: float


# --------------------
# debug/helper endpoints
# --------------------

@router.post("/debug/create-test-user")
async def create_test_user(db: Session = Depends(database.get_db)):
    """Create a test user for development/debugging."""
    from ..auth.password_utils import hash_password
    
    # Check if test user already exists
    existing = db.query(User).filter(User.username == "testuser").first()
    if existing:
        return {"status": "exists", "username": "testuser", "id": existing.id}
    
    # Create new test user
    test_user = User(
        username="testuser",
        hashed_password=hash_password("password123")
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    return {"status": "created", "username": "testuser", "id": test_user.id}


# --------------------
# CRUD operations updated with better error logging
# --------------------

@router.post("/add")
async def add_to_portfolio(
    item: PortfolioItem,
    db: Session = Depends(database.get_db),
    current_user: str = Depends(get_current_user),
):
    """Add stock to the current user's portfolio."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"[Portfolio] Adding stock for user: {current_user}")
    
    # look up user id from username
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        logger.error(f"[Portfolio] User not found: {current_user}")
        raise HTTPException(status_code=404, detail=f"User '{current_user}' not found. Please create user first.")

    logger.info(f"[Portfolio] User found: {user.id}, adding {item.quantity} shares of {item.symbol}")
    
    entry = Portfolio(
        user_id=user.id, symbol=item.symbol.upper(),
        quantity=item.quantity, buy_price=item.buy_price,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    logger.info(f"[Portfolio] Stock added successfully: {item.symbol}")
    return {"status": "added", "item": item.dict()}


@router.get("/", response_model=List[PortfolioItem])
async def get_portfolio(
    db: Session = Depends(database.get_db),
    current_user: str = Depends(get_current_user),
):
    """Retrieve portfolio items for the authenticated user."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"[Portfolio] Fetching portfolio for user: {current_user}")
    
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        logger.error(f"[Portfolio] User not found: {current_user}")
        raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"[Portfolio] User found: {user.id}")
    
    rows = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user.id)
        .all()
    )
    
    logger.info(f"[Portfolio] Found {len(rows)} portfolio items for user {user.id}")
    
    return [
        PortfolioItem(symbol=r.symbol, quantity=r.quantity, buy_price=r.buy_price)
        for r in rows
    ]


@router.delete("/{symbol}")
async def remove_from_portfolio(
    symbol: str,
    db: Session = Depends(database.get_db),
    current_user: str = Depends(get_current_user),
):
    """Remove a stock from the user's portfolio by symbol."""
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(Portfolio).filter(
        Portfolio.user_id == user.id,
        Portfolio.symbol == symbol.upper(),
    ).delete()
    db.commit()
    return {"status": "removed", "symbol": symbol.upper()}


# --------------------
# risk endpoint
# --------------------

@router.get("/risk", response_model=RiskAnalysis)
async def get_portfolio_risk(
    db: Session = Depends(database.get_db),
    current_user: str = Depends(get_current_user),
):
    """Compute a simple risk analysis of the user's portfolio."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"[Portfolio] Computing risk analysis for user: {current_user}")
    
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        logger.error(f"[Portfolio] User not found: {current_user}")
        raise HTTPException(status_code=404, detail="User not found")

    rows = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
    logger.info(f"[Portfolio] Found {len(rows)} holdings for user {user.id}")
    
    holdings = [
        {"symbol": r.symbol, "quantity": r.quantity, "buy_price": r.buy_price}
        for r in rows
    ]
    analysis = calculate_portfolio_risk(holdings)
    # Return the dict directly (no .dict() call needed)
    return {
        "diversification_score": analysis.get("diversification_score", 0.0),
        "volatility_risk": analysis.get("volatility_risk", 0.0),
        "allocation_imbalance": analysis.get("allocation_imbalance", 0.0)
    }
