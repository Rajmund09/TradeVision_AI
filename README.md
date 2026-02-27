# TradeVision AI - Stock Market Intelligence Platform

A full-stack machine learning application for intelligent stock market analysis and trading recommendations. Combines technical analysis, LSTM predictions, sentiment analysis, and risk assessment into a unified trading platform.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [ML Models](#ml-models)
- [Configuration](#configuration)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                    │
│         ┌─────────────────────────────────────┐              │
│         │ Dashboard │ Prediction │ Portfolio   │              │
│         │ Advisor   │ Auth Pages │ Components  │              │
│         └─────────────────────────────────────┘              │
└────────────────────┬────────────────────────────────────────┘
                     │ Axios + JWT
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Backend (FastAPI + SQLAlchemy)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Routes: Auth | Predictions | Portfolio | News    │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │              ML Pipeline                             │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Data Pipeline: Feature Engineering │ Indicators│  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Inference: Technical + LSTM Hybrid Score      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Scoring: Technical | Risk | Trend | Sentiment │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ SQLAlchemy ORM
                     │
┌────────────────────▼────────────────────────────────────────┐
│              MySQL Database                                  │
│  ┌───────────┬──────────────┬──────────┬──────────┐         │
│  │ Users     │ Portfolios   │ Watchlist│ Predicts │         │
│  └───────────┴──────────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
TradeVision-AI/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── database.py             # SQLAlchemy configuration
│   │   ├── models.py               # SQLAlchemy ORM models (User, Portfolio, etc.)
│   │   ├── schemas.py              # Pydantic request/response schemas
│   │   │
│   │   ├── api/                    # API route handlers
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── prediction_routes.py # Stock prediction endpoints
│   │   │   ├── portfolio_routes.py  # Portfolio CRUD endpoints
│   │   │   └── news_routes.py       # News/sentiment endpoints
│   │   │
│   │   ├── ml/                     # Machine Learning pipeline
│   │   │   ├── indicators/         # Technical indicators
│   │   │   │   └── indicators.py   # RSI, EMA, MACD, ATR, Bollinger Bands, etc.
│   │   │   ├── data_pipeline/      # Data processing
│   │   │   │   ├── fetch_prices.py
│   │   │   │   ├── feature_engineering.py
│   │   │   │   ├── dataset_builder.py
│   │   │   │   └── generate_charts.py
│   │   │   ├── training/           # Model training scripts
│   │   │   │   ├── train_lstm.py
│   │   │   │   ├── train_cnn.py
│   │   │   │   ├── train_next_7day.py
│   │   │   │   └── train_next_30day.py
│   │   │   ├── inference/          # Prediction/inference logic
│   │   │   │   ├── predict.py      # Main prediction endpoint
│   │   │   │   ├── lstm_predict.py
│   │   │   │   ├── cnn_predict.py
│   │   │   │   ├── hybrid_decision.py
│   │   │   │   ├── confidence_engine.py
│   │   │   │   └── explanation.py
│   │   │   ├── scoring_engine/     # Multi-factor scoring
│   │   │   │   ├── final_score.py
│   │   │   │   ├── technical_score.py
│   │   │   │   ├── trend_score.py
│   │   │   │   ├── risk_score.py
│   │   │   │   └── sentiment_score.py
│   │   │   └── news_engine/        # News sentiment analysis
│   │   │       ├── news_fetcher.py
│   │   │       └── news_sentiment.py
│   │   │
│   │   ├── auth/                   # Authentication layer
│   │   │   ├── auth_service.py     # User registration/login
│   │   │   ├── jwt_handler.py      # JWT token management
│   │   │   └── password_utils.py   # Password hashing/verification
│   │   │
│   │   └── utils/                  # Utilities
│   │       ├── logger.py           # Structured logging
│   │       └── helpers.py          # Helper functions
│   │
│   ├── .env.example                # Environment variables template
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # Backend documentation
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # Vite entry point
│   │   ├── App.jsx                 # Root component with routing
│   │   │
│   │   ├── pages/                  # Route pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Prediction.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   └── Advisor.jsx
│   │   │
│   │   ├── components/             # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── StockCard.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ConfidenceMeter.jsx
│   │   │   ├── RiskMeter.jsx
│   │   │   └── ScoreBreakdown.jsx
│   │   │
│   │   ├── api/                    # API client modules
│   │   │   ├── axios.js
│   │   │   ├── authApi.js
│   │   │   ├── predictionApi.js
│   │   │   ├── portfolioApi.js
│   │   │   └── newsApi.js
│   │   │
│   │   ├── context/                # React Context state management
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── routes/                 # Route protection
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   └── styles/                 # CSS stylesheets
│   │       ├── index.css
│   │       ├── App.css
│   │       ├── components.css
│   │       └── navbar.css
│   │
│   ├── index.html                  # HTML entry point (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── README.md
│
├── database/
│   ├── schema.sql                  # MySQL schema
│   └── init.sql                    # Initial data (optional)
│
├── data/
│   ├── nifty100_symbols.csv        # List of NIFTY100 stocks
│   └── prices/                     # Historical price data
│       ├── ASIANPAINT.csv
│       ├── HDFCBANK.csv
│       └── ... (other stocks)
│
├── models/
│   ├── lstm/
│   │   ├── lstm_trend_model.keras
│   │   ├── lstm_7day_model.keras
│   │   └── lstm_30day_model.keras
│   └── cnn/
│       └── candlestick_pattern_model.keras
│
├── logs/
│   └── app.log                     # Application logs
│
├── requirements.txt                # Python dependencies
├── README.md                       # This file
└── docker-compose.yml              # Docker orchestration (optional)
```

## 🛠️ Technology Stack

### Backend
- **Framework:** FastAPI 0.95+
- **ORM:** SQLAlchemy 2.0+
- **Database Driver:** PyMySQL
- **Authentication:** JWT (python-jose), Passlib with bcrypt
- **ML/Data:** TensorFlow/Keras, Pandas, NumPy, scikit-learn
- **Data Fetching:** yfinance
- **Sentiment Analysis:** TextBlob
- **Logging:** Python logging module

### Frontend
- **Framework:** React 18.2+
- **Router:** React Router v6
- **Build Tool:** Vite 4.3+
- **HTTP Client:** Axios
- **Charting:** Chart.js with react-chartjs-2
- **Styling:** CSS3 (Flexbox, Grid)

### Database
- **MySQL 8.0+** with normalized schema
- Tables: `users`, `portfolios`, `predictions`, `watchlist`

## ✅ Prerequisites

- **Python 3.9+**
- **Node.js 16+** and npm
- **MySQL 8.0+** (local or Docker)
- **pip** (Python package manager)

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/TradeVision-AI.git
cd TradeVision-AI
```

### 2. Backend Setup

#### Create virtual environment
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### Configure database
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your MySQL credentials
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/tradevision
JWT_SECRET=your-super-secret-key-change-this
```

#### Initialize database
```bash
mysql -u root -p < ../database/schema.sql
# or use SQLAlchemy
cd app
python -c "from main import Base, engine; Base.metadata.create_all(engine)"
```

### 3. Frontend Setup

#### Install dependencies
```bash
cd frontend
npm install
```

#### Configure environment
```bash
# Copy environment template
cp .env.example .env

# Default settings:
VITE_API_URL=http://localhost:8000
```

## 🎯 Running the Application

### Start Backend Server
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API: `http://localhost:8000`
API Docs: `http://localhost:8000/docs` (Swagger UI)

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:3000`

### Build Frontend for Production
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "trader123",
  "password": "securepass123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "trader123",
  "password": "securepass123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Prediction Endpoints

#### Get Stock Prediction
```http
POST /predictions/predict
Authorization: Bearer {token}
Content-Type: application/json

{
  "symbol": "INFY",
  "days": 7
}

Response:
{
  "symbol": "INFY",
  "decision": "BUY",
  "score": 78.5,
  "technical_score": 75,
  "lstm_score": 82,
  "confidence": 89,
  "explanation": ["Strong RSI signal", "MACD bullish crossover", ...]
}
```

#### Get Prediction History
```http
GET /predictions/history/INFY
Authorization: Bearer {token}
```

### Portfolio Endpoints

#### Get Portfolio
```http
GET /portfolio/
Authorization: Bearer {token}
```

#### Add Stock to Portfolio
```http
POST /portfolio/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "symbol": "INFY",
  "quantity": 10,
  "buy_price": 1450.50
}
```

#### Remove Stock from Portfolio
```http
DELETE /portfolio/INFY
Authorization: Bearer {token}
```

#### Portfolio Risk Analysis
```http
GET /portfolio/risk
Authorization: Bearer {token}
```

Returns simple metrics describing concentration and volatility of the
current holdings. Example response:
```json
{
  "diversification_score": 0.83,
  "volatility_risk": 0.027,
  "allocation_imbalance": 0.15
}
```
* **diversification_score** – 0‑1 (higher = more diversified)
* **volatility_risk** – weighted daily return standard deviation
* **allocation_imbalance** – deviation from equal-weight allocation


### News Endpoints

#### Get Stock News
```http
GET /news/stock/INFY
Authorization: Bearer {token}
```

#### Get Market News
```http
GET /news/market
Authorization: Bearer {token}
```

## 🤖 ML Models

### LSTM Trend Model
- **Input:** 60-day feature window (RSI, EMA, MACD, etc.)
- **Architecture:** 2 LSTM layers + Dropout + Dense layer
- **Output:** Probability of uptrend [0-100]
- **Path:** `models/lstm/lstm_trend_model.keras`

### Technical Analysis Features
Computed from OHLCV data:
- **RSI (14):** Momentum strength (0-100)
- **EMA (20/50):** Trend direction
- **MACD:** Trend change signal
- **ATR (14):** Volatility/risk measure
- **Bollinger Bands:** Overbought/oversold
- **Stochastic:** Momentum confirmation

### Hybrid Decision Engine
Final decision = 60% Technical Score + 40% LSTM Probability

## ⚙️ Configuration

### Backend .env Template
```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/tradevision
JWT_SECRET=change-this-to-a-strong-random-string
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=["http://localhost:3000"]
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
DEBUG=False
```

### Frontend .env Template
```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=TradeVision AI
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Portfolios Table
```sql
CREATE TABLE portfolios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  buy_price DECIMAL(10, 2) NOT NULL,
  buy_date DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Predictions Table
```sql
CREATE TABLE predictions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(50) NOT NULL,
  decision VARCHAR(20) NOT NULL,
  score DECIMAL(5, 2),
  technical_score DECIMAL(5, 2),
  lstm_score DECIMAL(5, 2),
  confidence DECIMAL(5, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Watchlist Table
```sql
CREATE TABLE watchlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_watchlist (user_id, symbol),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🐳 Docker Setup (Optional)

```bash
docker-compose up -d
# Starts: MySQL, FastAPI backend, React frontend
```

See `docker-compose.yml` for configuration.

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Happy Trading! 📈**
