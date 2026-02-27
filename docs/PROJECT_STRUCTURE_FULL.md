TradeVision-AI/
│
├── README.md
├── requirements.txt                # Backend requirements
├── .gitignore
├── PROJECT_STRUCTURE.md
├── PROJECT_STRUCTURE_FULL.md
│
├── frontend/                       # ⚛️ React Frontend
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       │
│       ├── api/
│       │   ├── axios.js
│       │   ├── authApi.js
│       │   ├── predictionApi.js
│       │   ├── portfolioApi.js
│       │   └── newsApi.js
│       │
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Prediction.jsx
│       │   ├── Portfolio.jsx
│       │   └── Advisor.jsx
│       │
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── StockCard.jsx
│       │   ├── ConfidenceMeter.jsx
│       │   ├── RiskMeter.jsx
│       │   ├── ScoreBreakdown.jsx
│       │   └── Loader.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       │
│       └── routes/
│           └── ProtectedRoute.jsx
│
│
├── backend/                        # 🐍 FastAPI Backend
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── app/
│   │   ├── main.py                 # FastAPI entry
│   │   │
│   │   ├── api/
│   │   │   ├── auth_routes.py
│   │   │   ├── prediction_routes.py
│   │   │   ├── portfolio_routes.py
│   │   │   └── news_routes.py
│   │   │
│   │   ├── auth/
│   │   │   ├── auth_service.py
│   │   │   ├── jwt_handler.py
│   │   │   └── password_utils.py
│   │   │
│   │   ├── database/
│   │   │   ├── db.py               # MySQL connection
│   │   │   ├── models.py           # SQLAlchemy models
│   │   │   └── schemas.py          # Pydantic schemas
│   │   │
│   │   ├── ml/                     # 🧠 AI Core
│   │   │
│   │   │   ├── data_pipeline/
│   │   │   │   ├── fetch_prices.py
│   │   │   │   ├── feature_engineering.py
│   │   │   │   ├── dataset_builder.py
│   │   │   │   └── generate_charts.py
│   │   │   │
│   │   │   ├── indicators/
│   │   │   │   └── indicators.py
│   │   │   │
│   │   │   ├── training/
│   │   │   │   ├── train_lstm.py
│   │   │   │   ├── train_cnn.py
│   │   │   │   ├── train_next_7day.py
│   │   │   │   └── train_next_30day.py
│   │   │   │
│   │   │   ├── inference/
│   │   │   │   ├── lstm_predict.py
│   │   │   │   ├── cnn_predict.py
│   │   │   │   ├── hybrid_decision.py
│   │   │   │   ├── confidence_engine.py
│   │   │   │   └── explanation.py
│   │   │   │
│   │   │   ├── scoring_engine/
│   │   │   │   ├── technical_score.py
│   │   │   │   ├── trend_score.py
│   │   │   │   ├── risk_score.py
│   │   │   │   ├── sentiment_score.py
│   │   │   │   └── final_score.py
│   │   │   │
│   │   │   └── news_engine/
│   │   │       ├── news_fetcher.py
│   │   │       └── news_sentiment.py
│   │   │
│   │   └── utils/
│   │       ├── logger.py
│   │       └── helpers.py
│   │
│   ├── models/                     # Trained AI models
│   │   ├── lstm_model.h5
│   │   ├── cnn_model.h5
│   │   ├── next_7day_model.keras
│   │   ├── next_30day_model.keras
│   │   └── scaler.pkl
│
│
├── data/
│   ├── nifty100_symbols.csv
│   ├── prices/
│   │   ├── ASIANPAINT.csv
│   │   ├── AXISBANK.csv
│   │   └── ...
│   │
│   ├── charts/                     # Generated chart images for CNN
│   └── processed/
│
│
├── database/
│   └── schema.sql                  # MySQL schema
│
└── logs/