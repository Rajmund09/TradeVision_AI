import os
import numpy as np
import pandas as pd
import pickle

# project root directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

from ..features.technical_indicators import add_all_indicators


DATA_DIR = os.path.join(BASE_DIR, "data", "prices")

MODEL_DIR = os.path.join(BASE_DIR, "models", "lstm")

SCALER_DIR = os.path.join(BASE_DIR, "models", "scaler")

MODEL_PATH = os.path.join(MODEL_DIR, "model_7day.keras")

SCALER_PATH = os.path.join(SCALER_DIR, "scaler_7day.pkl")

SEQUENCE = 60


os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(SCALER_DIR, exist_ok=True)


def load_data():

    dfs = []

    for file in os.listdir(DATA_DIR):

        if file.endswith(".csv"):

            print("Loading", file)

            df = pd.read_csv(os.path.join(DATA_DIR, file))

            df = add_all_indicators(df)

            # future 7-day return
            df["target"] = (
                df["Close"].shift(-7) - df["Close"]
            ) / df["Close"]

            df = df.dropna()

            dfs.append(df)

    return pd.concat(dfs, ignore_index=True)


def create_sequences(features, target):

    X = []
    y = []

    for i in range(SEQUENCE, len(features)):

        X.append(features[i-SEQUENCE:i])

        y.append(target[i])

    return np.array(X), np.array(y)


def train():

    print("Loading data...")

    df = load_data()

    feature_cols = [
        "Close",
        "Volume",
        "RSI",
        "EMA12",
        "EMA26"
    ]

    features = df[feature_cols].values

    target = df["target"].values


    print("Scaling...")

    scaler = MinMaxScaler()

    features_scaled = scaler.fit_transform(features)

    pickle.dump(scaler, open(SCALER_PATH, "wb"))

    print("Scaler saved")


    print("Creating sequences...")

    X, y = create_sequences(features_scaled, target)

    print("Shape:", X.shape)


    print("Building model...")

    model = Sequential()

    model.add(
        LSTM(
            64,
            return_sequences=True,
            input_shape=(X.shape[1], X.shape[2])
        )
    )

    model.add(Dropout(0.2))

    model.add(LSTM(32))

    model.add(Dropout(0.2))

    model.add(Dense(1))

    model.compile(
        optimizer="adam",
        loss="mse"
    )


    print("Training...")

    model.fit(
        X,
        y,
        epochs=10,
        batch_size=32
    )


    model.save(MODEL_PATH)

    print("\n✅ 7-day model saved at:")
    print(MODEL_PATH)


if __name__ == "__main__":

    train()