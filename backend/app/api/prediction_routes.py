# Prediction routes
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, constr

from ..ml.inference.predict import predict_stock

router = APIRouter(prefix="/predictions", tags=["predictions"])


class PredictionRequest(BaseModel):
    # stock symbols are non‑empty strings; we strip whitespace to avoid errors
    symbol: constr(strip_whitespace=True, min_length=1)


class PredictionResponse(BaseModel):
    symbol: str
    decision: str
    score: float
    technical_score: float
    lstm_probability: float
    latest_price: float
    explanation: list


@router.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictionRequest):
    """Get trading prediction for a stock.

    The request body contains the `symbol` to look up.  We delegate
    to the hybrid decision engine (`predict_stock`) which:

    * loads historical price data for the symbol
    * builds technical features
    * scores using indicators and an LSTM
    * returns a decision, confidence score and explanation list

    Proper HTTP errors are raised for missing data or unexpected failures.
    """
    try:
        result = predict_stock(req.symbol)
    except Exception as exc:  # pragma: no cover - bubble up unexpected errors
        # log.exception(exc)  # add logging if desired
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"prediction engine error: {exc}",
        )

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock data not found")

    return result


@router.get("/history/{symbol}")
async def get_prediction_history(symbol: str, limit: int = 10):
    """Get prediction history for a symbol"""
    # TODO: Fetch from database
    return {"symbol": symbol, "predictions": []}
