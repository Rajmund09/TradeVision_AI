"""
Compute portfolio allocations and related metrics.
"""

from typing import List, Dict, Any


def calculate_allocations(positions: List[Any]) -> Dict[str, float]:
    """Return a mapping of symbol -> allocation percentage.

    ``positions`` may be a list of ORM objects or simple dicts with
    ``symbol``, ``quantity`` and ``buy_price`` attributes/keys. This
    helper lives in the service layer so that the route handlers stay
    thin and business‑logic free.
    """
    total_value = 0.0
    for p in positions:
        qty = getattr(p, "quantity", p.get("quantity"))
        price = getattr(p, "buy_price", p.get("buy_price"))
        total_value += qty * price

    if total_value == 0:
        return {}

    allocations: Dict[str, float] = {}
    for p in positions:
        sym = getattr(p, "symbol", p.get("symbol"))
        qty = getattr(p, "quantity", p.get("quantity"))
        price = getattr(p, "buy_price", p.get("buy_price"))
        allocations[sym] = (qty * price) / total_value

    return allocations
