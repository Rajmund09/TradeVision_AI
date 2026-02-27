# News routes
from fastapi import APIRouter

from ..ml.news_engine.news_fetcher import fetch_stock_news, fetch_market_news
from ..ml.news_engine.news_sentiment import analyze_news_sentiment

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/stock/{symbol}")
async def get_stock_news(symbol: str, limit: int = 10):
    """Get news for a specific stock"""
    news = fetch_stock_news(symbol, limit)
    return news


@router.get("/market")
async def get_market_news(limit: int = 10):
    """Get general market news"""
    news = fetch_market_news(limit)
    return news


@router.post("/sentiment")
async def analyze_sentiment(articles: list):
    """Analyze sentiment of news articles"""
    sentiments = analyze_news_sentiment(articles)
    return {"sentiments": sentiments}
