# Project Structure and Directory Overview

This document outlines the full file structure of the TradeVision-AI project and explains the purpose of each directory along with an agenda for understanding and working with the project.

## 📁 Root Directory

- `README.md` – Provides an introduction and setup instructions for the project.
- `requirements.txt` – Lists Python dependencies required to run the application.

## 📁 dashboard
Contains the web dashboard components built with a Python web framework (likely Streamlit or Flask).
- `app.py` – Entry point for the dashboard application.
- `components.py` – Defines UI components used across the dashboard.
- `styles.css` – Custom CSS styling for the dashboard.
- `utils.py` – Utility functions supporting dashboard logic.

## 📁 data
Stores raw and processed data used by the application.
- `nifty100_symbols.csv` – List of stock symbols from the NIFTY 100 index.

### 📁 data/prices
CSV files of historical price data for each symbol (e.g., `ASIANPAINT.csv`, `TCS.csv`, etc.).

### 📁 data/processed
(empty or holds transformed datasets after preprocessing)

## 📁 models
Contains trained model binaries and possibly scalers.
- `next_30day_model.keras` – Model for predicting next 30 days.
- `next_7day_model.keras` – Model for predicting next 7 days.
- `scaler.pkl` – Preprocessing scaler used during training and inference.

### 📁 models/lstm
- `lstm_trend_model.keras` – LSTM model for trend prediction.

## 📁 src
Source code for the main project, subdivided by functionality.

### 📁 src/data_pipeline
Data acquisition and preprocessing logic.
- `fetch_prices.py` – Gets raw price data from external sources.
- `feature_engineering.py` – Creates features for model training.
- `dataset_builder.py` – Constructs datasets for different model tasks.

### 📁 src/inference
Runtime prediction scripts.
- `predict.py` – Generic prediction interface.

### 📁 src/model
Model training and evaluation scripts.
- `train_next_7day.py` – Train model for 7-day prediction.
- `train_next_30day.py` – Train model for 30-day prediction.
- `train_lstm.py` & `train_cnn_pattern.py` – Scripts for training specific architectures.
- `evaluate.py` – Evaluate model performance.
- `lstm_predict.py` – LSTM-specific inference logic.

### 📁 src/news_engine
- `news_analyzer.py` – Analyze news data for sentiment or relevance.

### 📁 src/scoring_engine
Computes various scores used in portfolio or trading decisions.
- `technical_score.py`
- `sentiment_score.py`
- `risk_score.py`
- `trend_score.py`
- `final_score.py` – Combines other scores into a total rating.


---

## 🎯 Agenda and Usage

1. **Setup**
   - Install dependencies from `requirements.txt`.
   - Review `README.md` for environment configuration.
2. **Data Preparation**
   - Use scripts in `src/data_pipeline` to fetch and preprocess data.
   - Store raw CSVs in `data/prices` and processed outputs in `data/processed`.
3. **Model Training**
   - Run relevant training scripts in `src/model` to generate models under `models/`.
   - Evaluate via `src/model/evaluate.py`.
4. **Inference & Scoring**
   - Use `src/inference/predict.py` for predictions.
   - Apply scoring functions from `src/scoring_engine` to derive final scores.
5. **Dashboard**
   - Launch `dashboard/app.py` to visualize predictions and scores.
6. **News Analysis**
   - Use `src/news_engine/news_analyzer.py` to incorporate news sentiment into scores.

This MD file serves as the central reference for developers and contributors to understand project layout, responsibilities of each module, and the step-by-step workflow to run and extend the application.
