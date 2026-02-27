import os
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta


def fetch_last_5_years_daily(symbol_csv_path):
    """Fetch 5-year daily OHLCV data for all symbols in CSV"""

    symbols_df = pd.read_csv(symbol_csv_path)

    # Automatically detect first column
    first_column = symbols_df.columns[0]
    symbols = symbols_df[first_column].dropna().tolist()

    os.makedirs("data/prices", exist_ok=True)

    # Dynamic dates
    end_date = datetime.today()
    start_date = end_date - timedelta(days=5*365)

    for symbol in symbols:

        print(f"Downloading 5-year daily data for {symbol}...")

        df = yf.download(
            symbol,
            start=start_date.strftime("%Y-%m-%d"),
            end=end_date.strftime("%Y-%m-%d"),
            interval="1d"
        )

        if df.empty:
            print(f"No data for {symbol}")
            continue

        df.reset_index(inplace=True)

        # Keep only required columns
        df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]

        clean_name = symbol.replace(".NS", "")
        df.to_csv(f"data/prices/{clean_name}.csv", index=False)

        print(f"Saved {clean_name}.csv")

    print("All 5-year daily downloads complete.")


if __name__ == "__main__":
    fetch_last_5_years_daily("data/nifty100_symbols.csv")
