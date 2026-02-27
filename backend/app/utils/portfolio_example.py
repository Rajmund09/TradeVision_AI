"""Example usage of the portfolio risk calculator.

Run this script from the repository root after activating the virtual
environment (it only requires pandas which is already in requirements).
"""
from .helpers import calculate_portfolio_risk

if __name__ == "__main__":
    # pretend the user holds three symbols
    sample_holdings = [
        {"symbol": "SBIN", "quantity": 100, "buy_price": 250.0},
        {"symbol": "TCS", "quantity": 50, "buy_price": 3300.0},
        {"symbol": "RELIANCE", "quantity": 20, "buy_price": 2500.0},
    ]

    risk = calculate_portfolio_risk(sample_holdings)
    print("Risk analysis:", risk)
