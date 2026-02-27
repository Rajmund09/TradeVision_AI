"""
News fetching and sentiment‑analysis helpers.
"""

from typing import Any

from ..ml.news_engine.news_fetcher import fetch_stock_news
from ..ml.news_engine.news_sentiment import analyze_sentiment


def sentiment_for_symbol(symbol: str) -> Any:
    """Return the sentiment score or data for the given symbol.

    This helper stitches together the news fetcher and sentiment engine.
    """
    articles = fetch_stock_news(symbol)
    return analyze_sentiment(articles)
