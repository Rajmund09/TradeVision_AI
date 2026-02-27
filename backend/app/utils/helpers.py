# Helper functions
from datetime import datetime


def format_price(price: float, decimals: int = 2) -> str:
    """Format price as string"""
    return f"₹ {price:,.{decimals}f}"


def get_date_range(days: int = 365):
    """Get date range for historical data"""
    from datetime import timedelta
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date


def calculate_returns(buy_price: float, current_price: float) -> float:
    """Calculate percentage returns"""
    if buy_price == 0:
        return 0
    return ((current_price - buy_price) / buy_price) * 100


def calculate_portfolio_risk(holdings: list) -> dict:
    """Estimate risk metrics for a list of holdings.

    Each holding is expected to be a dict with at least:
        - symbol: stock ticker
        - quantity: number of shares held
        - buy_price: price paid per share (optional)
    The function will attempt to load historical prices from the
    ``data/prices`` directory (same structure as the shipped sample
    data).  If price history isn't available, it will fall back to
    ``current_price`` key or zero values.

    Returns a dictionary with three normalized metrics (0-1):
        * diversification_score: 1.0 when all positions are equal weight,
          decreases toward 0 as a single position dominates.
        * volatility_risk: weighted average of individual security
          volatilities (std dev of daily returns).  Higher means more
          risk.
        * allocation_imbalance: sum of absolute differences between each
          weight and the equal-weight benchmark; 0 indicates a perfectly
          balanced portfolio.
    """
    import os
    import pandas as pd

    # calculate current value for each holding (use last close price if
    # available)
    values = []
    vols = []
    base_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'data', 'prices')
    for h in holdings:
        symbol = h.get('symbol', '').upper()
        qty = h.get('quantity', h.get('shares', 0)) or 0
        current_price = None
        csv_file = os.path.join(base_path, f"{symbol}.csv")
        if os.path.exists(csv_file):
            try:
                df = pd.read_csv(csv_file)
                # try to detect a price column
                price_col = 'Close' if 'Close' in df.columns else df.columns[1]
                current_price = float(df[price_col].iloc[-1])
                # compute volatility of daily returns
                returns = df[price_col].pct_change().dropna()
                vols.append(returns.std())
            except Exception:
                current_price = None
                vols.append(0)
        else:
            vols.append(0)

        if current_price is None:
            current_price = h.get('current_price') or h.get('avgPrice') or 0
        values.append(qty * current_price)

    total = sum(values) or 1e-9
    weights = [v / total for v in values]

    # diversification: penalize overweight positions
    diversification_score = 1 - (max(weights) if weights else 0)

    # volatility risk is weighted average of individual volatilities
    volatility_risk = sum(w * v for w, v in zip(weights, vols))

    # allocation imbalance: sum of abs(weight - equal_weight)
    n = len(weights)
    if n > 0:
        equal = 1.0 / n
        imbalance = sum(abs(w - equal) for w in weights)
    else:
        imbalance = 0

    return {
        "diversification_score": round(diversification_score, 4),
        "volatility_risk": round(volatility_risk, 4),
        "allocation_imbalance": round(imbalance, 4),
    }
