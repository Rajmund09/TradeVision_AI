# TradeVision AI - Complete Setup & Installation Guide

Comprehensive step-by-step guide to set up and run the entire TradeVision AI application.

## 📋 Prerequisites

### System Requirements
- **OS:** Windows, macOS, or Linux
- **Python:** 3.9 or higher
- **Node.js:** 16 or higher
- **MySQL:** 8.0 or higher
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 2GB

### Required Software
```bash
# Check Python
python --version  # Should be 3.9+

# Check Node.js
node --version    # Should be 16+
npm --version

# Check MySQL
mysql --version   # Should be 8.0+
```

## 🗂️ Project Structure Overview

```
TradeVision-AI/
├── backend/              # FastAPI backend + ML pipeline
├── frontend/             # React frontend with Vite
├── database/             # MySQL schema files
├── data/                 # Stock price data (CSV)
├── models/               # Pre-trained ML models
├── logs/                 # Application logs
├── requirements.txt      # Python dependencies
├── README.md            # Main documentation
└── SETUP.md             # This file
```

## 🚀 Installation Steps

### Step 1: Clone or Extract Project

```bash
# If cloning from Git
git clone https://github.com/yourusername/TradeVision-AI.git
cd TradeVision-AI

# Or extract from ZIP
# Navigate to project root
cd TradeVision-AI
```

### Step 2: Setup Database

#### 2.1 Start MySQL Server

**Windows:**
```powershell
# If MySQL is installed as service
net start MySQL80

# Or use MySQL Shell
mysql -u root -p
```

**macOS (with Homebrew):**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

#### 2.2 Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Then run in MySQL prompt:
CREATE DATABASE tradevision;
EXIT;

# Or one-liner
mysql -u root -p -e "CREATE DATABASE tradevision;"
```

#### 2.3 Initialize Schema

```bash
# From project root
mysql -u root -p tradevision < database/schema.sql

# Verify tables created
mysql -u root -p tradevision -e "SHOW TABLES;"
```

You should see:
```
predictions
portfolios
users
watchlist
```

### Step 3: Setup Backend (FastAPI)

#### 3.1 Create Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 3.2 Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs:
- FastAPI, Uvicorn (web framework)
- SQLAlchemy, PyMySQL (database)
- TensorFlow, Keras (ML)
- Pandas, NumPy (data processing)
- yfinance (stock data)
- python-jose, passlib (authentication)
- And 15+ more packages

#### 3.3 Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (important!)
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Required settings in `.env`:**
```ini
# Database (choose one of the following options)
# 1. Local/MySQL
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/tradevision

# 2. Supabase/Postgres (overrides DATABASE_URL automatically)
# SUPABASE_URL=https://<your-project>.supabase.co
# SUPABASE_KEY=<anon-or-service-role-api-key>
# SUPABASE_DB_USER=postgres
# SUPABASE_DB_PASSWORD=<db-password>
# SUPABASE_DB_HOST=db.<your-project>.supabase.co
# SUPABASE_DB_NAME=postgres
# SUPABASE_DB_PORT=5432

# JWT Authentication (change this!)
JWT_SECRET=your-super-secret-key-change-this-in-production

# CORS (allow frontend)
CORS_ORIGINS=["http://localhost:3000"]

# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# Logging
LOG_LEVEL=INFO

# Debug
DEBUG=False
```

#### 3.4 Test Backend

```bash
# With virtual environment activated
cd app
python -c "from main import app; print('Backend imports successful!')"

# Or test startup
cd ..
uvicorn app.main:app --reload

# Should see:
# Uvicorn running on http://127.0.0.1:8000
# Press CTRL+C to quit
```

Visit http://localhost:8000/docs to see API documentation.

**Demo account**: the system ships with a built‑in demo login.  Use the following credentials on the frontend login page (they are autocompleted by default):

```
Email: demo@demo.com
Password: demo123
```

The backend will automatically create the user on first login if it does not already exist.  This account is intended for development only; change or remove it before deploying.


### Step 4: Setup Frontend (React)

#### 4.1 Install Node Dependencies

```bash
cd frontend
npm install
```

This installs React, Router, Axios, Vite, and dependencies (~500MB).

#### 4.2 Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env (should work as-is for local development)
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=TradeVision AI
```

#### 4.3 Test Frontend Build

```bash
# Build production version
npm run build

# Should complete without errors
# Creates dist/ folder

# Start development server
npm run dev

# Should see:
# VITE v4.3+ ready in xxx ms
# ➜ Local: http://localhost:3000/
```

Visit http://localhost:3000 to see the frontend.

## 🎯 Running the Application

### Option A: Two Terminal Windows (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd TradeVision-AI/backend
.\venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate         # macOS/Linux
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd TradeVision-AI/frontend
npm run dev
```

### Option B: Docker Compose (Recommended for Production)

```bash
# From project root
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option C: Background Services

**Windows PowerShell:**
```powershell
# Start backend in background
$backend = Start-Process -FilePath "powershell" `
  -ArgumentList "cd backend; .\venv\Scripts\activate.ps1; uvicorn app.main:app --reload" `
  -PassThru

# Start frontend in background
$frontend = Start-Process -FilePath "powershell" `
  -ArgumentList "cd frontend; npm run dev" `
  -PassThru

# Stop later
Stop-Process -Id $backend.Id
Stop-Process -Id $frontend.Id
```

## ✅ Verification Checklist

After startup, verify everything works:

- [ ] Backend runs: http://localhost:8000 (returns 200)
- [ ] API docs available: http://localhost:8000/docs (Swagger UI)
- [ ] Frontend runs: http://localhost:3000 (loads page)
- [ ] Database connected: Can login/register a user
- [ ] Stock prediction works: Can search "INFY" and get prediction
- [ ] Portfolio functions: Can add/remove stocks

### Quick Test

```bash
# Terminal 3 - Test API
# Test health check
curl http://localhost:8000/

# Test registration
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Should return user_id and username
```

## 🛠️ Common Setup Issues

### Issue 1: "MySQL connection refused"

**Solution:**
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1"

# If fails, start MySQL:
# Windows: net start MySQL80
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Update DATABASE_URL in .env:
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/tradevision
```

### Issue 2: "Port 8000 already in use"

**Solution:**
```bash
# Windows: Find process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Or use different port:
uvicorn app.main:app --reload --port 8001
```

### Issue 3: "Port 3000 already in use"

**Solution:**
```bash
# Windows: Find process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or update vite config to different port
```

### Issue 4: "ModuleNotFoundError: No module named..."

**Solution:**
```bash
# Make sure virtual environment is activated
# Windows: .\venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt

# Or upgrade pip first
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Issue 5: "CORS error in browser"

**Solution:**
```bash
# Check backend CORS_ORIGINS in .env:
CORS_ORIGINS=["http://localhost:3000"]

# Restart backend after changing .env
# Should see CORS headers in browser DevTools
```

### Issue 6: "JWT token invalid"

**Solution:**
```bash
# Clear localStorage in browser
# DevTools → Application → Storage → localStorage → Clear All

# Make sure JWT_SECRET in .env is consistent
# Don't change JWT_SECRET between login and subsequent requests

# Re-login and try again
```

## 📚 First-Time Usage

### 1. Register a New User

**Via Frontend:**
1. Go to http://localhost:3000
2. Click "Register"
3. Enter username and password
4. Click "Register"
5. Redirects to login page
6. Login with new credentials

**Via API (curl):**
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "trader1",
    "password": "SecurePass123!"
  }'
```

### 2. Get Stock Prediction

**Via Frontend:**
1. Login
2. Go to "Prediction" page
3. Enter stock symbol (e.g., "INFY")
4. Click "Predict"
5. See results: Decision, Score, Confidence, Explanation

**Via API (curl):**
```bash
# First, get login token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "trader1",
    "password": "SecurePass123!"
  }'

# Get token from response (access_token field)

# Use token to make prediction
curl -X POST http://localhost:8000/predictions/predict \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "INFY",
    "days": 7
  }'
```

### 3. Manage Portfolio

**Via Frontend:**
1. Login
2. Go to "Portfolio" page
3. Add stock: Enter symbol, quantity, buy price → Click "Add"
4. View holdings in list
5. Remove: Click delete button

### 4. View Market Insights

**Via Frontend:**
1. Login
2. Go to "Advisor" page
3. View market news and sentiment
4. See AI-generated insights

## 🔄 Development Workflow

### Making Code Changes

**Backend:**
1. Edit Python files in `backend/app/`
2. Backend automatically reloads (due to `--reload` flag)
3. Check for errors in terminal
4. Test in Swagger UI at http://localhost:8000/docs

**Frontend:**
1. Edit React/CSS files in `frontend/src/`
2. Browser automatically reloads (Vite HMR)
3. Check for errors in browser console
4. Inspect changes at http://localhost:3000

### Running Tests

```bash
# Backend unit tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

### Checking Logs

**Backend logs:**
```bash
# Real-time logs from terminal where uvicorn runs
# Or check logs/app.log file

tail -f logs/app.log          # macOS/Linux
Get-Content -Tail 20 -Wait logs/app.log   # Windows
```

**Frontend logs:**
- Browser DevTools → Console tab
- Webpack/Vite build errors in terminal

## 🚢 Deployment Preparation

### Before Going to Production

1. **Security:**
   - [ ] Change `JWT_SECRET` to strong random string
   - [ ] Set `DEBUG=False` in backend .env
   - [ ] Update database URL to production server
   - [ ] Enable HTTPS/SSL

2. **Testing:**
   - [ ] Test all endpoints with Swagger UI
   - [ ] Test authentication flow
   - [ ] Test prediction accuracy
   - [ ] Test portfolio operations

3. **Configuration:**
   - [ ] Update CORS_ORIGINS to your domain
   - [ ] Configure proper logging paths
   - [ ] Set appropriate LOG_LEVEL
   - [ ] Update API_HOST to 0.0.0.0

4. **Database:**
   - [ ] Verify backups configured
   - [ ] Test disaster recovery
   - [ ] Check index performance
   - [ ] Enable query logging if needed

## 📞 Getting Help

### Check Logs First

**Backend errors:**
```bash
# Check terminal output where uvicorn runs
# Or check logs/app.log file
```

**Frontend errors:**
```bash
# Open DevTools (F12)
# Check Console tab for JavaScript errors
# Check Network tab for failed API calls
```

### Common Solutions

1. **Restart services** (often fixes transient issues)
2. **Check environment variables** (.env files)
3. **Verify database connection** (mysql -u root -p)
4. **Clear browser cache** (DevTools → Application → Storage → Clear)
5. **Reinstall dependencies** (pip install -r, npm install)

### Getting More Help

- Check README.md for architecture overview
- Check PROJECT_STRUCTURE.md for detailed file breakdown
- Review code comments for complex logic
- Review code comments for complex logic

## 🎓 Next Steps

After successful setup:

1. **Explore the Code:**
   - Understand backend structure (README.md, PROJECT_STRUCTURE.md)
   - Review frontend components
   - Check ML pipeline modules

2. **Customize Models:**
   - Retrain LSTM with latest data
   - Adjust technical indicator parameters
   - Fine-tune scoring weights

3. **Add Features:**
   - New technical indicators
   - Additional sentiment sources
   - More portfolio metrics

4. **Deploy:**
   - Follow deployment preparation checklist
   - Set up Docker containers
   - Configure CI/CD pipeline

---

**Congratulations! You're ready to use TradeVision AI! 🎉**

For questions or issues, refer to README.md or the respective module documentation.
