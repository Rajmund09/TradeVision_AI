# TradeVision AI - Quick Reference Guide

Fast lookup for common tasks, commands, and solutions.

## 🚀 Getting Started (5 Minutes)

### Start Everything

**Windows PowerShell:**
```powershell
# Terminal 1: Backend
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

**macOS/Linux:**
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### Access Points
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

## 📋 Common Commands

### Backend

#### Setup
```bash
cd backend
python -m venv venv           # Create virtual environment
.\venv\Scripts\activate       # Windows
source venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env with database URL and secrets
```

#### Run
```bash
uvicorn app.main:app --reload                    # Development
uvicorn app.main:app --host 0.0.0.0 --port 8000 # Production-like
gunicorn app.main:app -w 4 -b 0.0.0.0:8000       # Gunicorn (production)
```

#### Train Models
```bash
# LSTM trend model
python -c "from app.ml.training.train_lstm import main; main()"

# 7-day ahead model
python -c "from app.ml.training.train_next_7day import main; main()"

# 30-day ahead model
python -c "from app.ml.training.train_next_30day import main; main()"

# CNN model
python -c "from app.ml.training.train_cnn import main; main()"
```

#### Test Predictions
```python
from app.ml.inference.predict import predict_stock
result = predict_stock("INFY")
print(result)
```

### Frontend

#### Setup
```bash
cd frontend
npm install
cp .env.example .env
```

#### Run
```bash
npm run dev              # Development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Database

#### Create Database
```bash
mysql -u root -p tradevision < database/schema.sql
```

#### Reset Database
```bash
mysql -u root -p -e "DROP DATABASE tradevision; CREATE DATABASE tradevision;"
mysql -u root -p tradevision < database/schema.sql
```

#### Query Database
```bash
mysql -u root -p tradevision -e "SELECT * FROM users;"
mysql -u root -p tradevision -e "SELECT * FROM portfolios;"
mysql -u root -p tradevision -e "SELECT * FROM predictions;"
mysql -u root -p tradevision -e "SELECT * FROM watchlist;"
```

## 🔐 Authentication Flow

### Register User (API)
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"trader1","password":"SecurePass123"}'
```

### Login User (API)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"trader1","password":"SecurePass123"}'

# Response includes: {"access_token": "...", "token_type": "bearer"}
```

### Save Token
```bash
# Manually (for testing)
TOKEN="eyJhbGc..."  # Copy from login response
echo $TOKEN

# Frontend saves automatically to localStorage
```

### Use Token
```bash
curl -X POST http://localhost:8000/predictions/predict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"INFY"}'
```

## 📊 API Endpoints Quick Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Get JWT token |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predictions/predict` | Get stock prediction |
| GET | `/predictions/history/{symbol}` | Prediction history |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolio/` | List stocks |
| POST | `/portfolio/add` | Add stock |
| DELETE | `/portfolio/{symbol}` | Remove stock |

### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/news/stock/{symbol}` | Stock news |
| GET | `/news/market` | Market news |
| POST | `/news/sentiment` | Analyze sentiment |

## 🛠️ Debugging

### Check Logs

**Backend:**
```bash
# Real-time logs
tail -f logs/app.log              # macOS/Linux
Get-Content -Tail 20 -Wait logs/app.log  # Windows

# Check specific error
grep "ERROR" logs/app.log
```

**Frontend:**
```bash
# Browser console (F12)
# Watch terminal for build errors
```

### Database Issues

```bash
# Test connection
mysql -u root -p -e "SELECT 1"

# Check tables exist
mysql -u root -p tradevision -e "SHOW TABLES;"

# Check specific table structure
mysql -u root -p tradevision -e "DESCRIBE users;"
```

### API Issues

```bash
# Test health check
curl http://localhost:8000/

# Check API docs
# Open http://localhost:8000/docs in browser

# Test with verbose output
curl -v http://localhost:8000/predictions/predict ...
```

### Port Already in Use

```bash
# Windows PowerShell
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

## 📁 File Locations

| File | Path | Purpose |
|------|------|---------|
| API Entry | `backend/app/main.py` | FastAPI app |
| Frontend Entry | `frontend/src/main.jsx` | React app |
| Database Schema | `database/schema.sql` | Tables/indexes |
| Config (Backend) | `backend/.env` | Database, JWT secret |
| Config (Frontend) | `frontend/.env` | API URL |
| Logs | `logs/app.log` | Application logs |
| Models | `models/lstm/` | Trained ML models |
| Stock Data | `data/prices/` | CSV price data |

## 🔄 Common Development Tasks

### Add New API Endpoint

1. **Define schema** in `backend/app/schemas.py`:
```python
class MyRequest(BaseModel):
    field: str

class MyResponse(BaseModel):
    result: str
```

2. **Add database model** in `backend/app/models.py` if needed

3. **Create route** in `backend/app/api/my_routes.py`:
```python
from fastapi import APIRouter
from ..schemas import MyRequest, MyResponse

router = APIRouter(prefix="/api/my", tags=["my"])

@router.post("/endpoint")
async def my_endpoint(req: MyRequest):
    return MyResponse(result="success")
```

4. **Register router** in `backend/app/main.py`:
```python
from .api import my_routes
app.include_router(my_routes.router)
```

### Add New React Page

1. **Create component** in `frontend/src/pages/MyPage.jsx`:
```jsx
import { useState } from 'react';
export default function MyPage() {
  const [data, setData] = useState(null);
  return <div>{/* content */}</div>;
}
```

2. **Add route** in `frontend/src/App.jsx`:
```jsx
<Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
```

3. **Add navigation** in `frontend/src/components/Navbar.jsx`:
```jsx
<Link to="/mypage">My Page</Link>
```

### Call API from Frontend

```javascript
import axios from '../api/axios';

async function fetchData() {
  try {
    const response = await axios.post('/predictions/predict', {
      symbol: 'INFY'
    });
    console.log(response.data);
  } catch (error) {
    console.error('API error:', error);
  }
}
```

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` in backend `.env`
- [ ] Set `DEBUG=False` in backend `.env`
- [ ] Update `DATABASE_URL` to production database
- [ ] Update `CORS_ORIGINS` to production domain
- [ ] Update frontend `VITE_API_URL` to production backend
- [ ] Build frontend: `npm run build`
- [ ] Test all endpoints with Swagger UI
- [ ] Verify authentication flow works
- [ ] Test predictions return correct format
- [ ] Check logs don't contain sensitive info
- [ ] Enable HTTPS/SSL
- [ ] Setup database backups
- [ ] Configure error monitoring/alerting

## 📈 Performance Optimization

### Backend
```python
# Lazy load models to avoid startup delay
from functools import lru_cache

@lru_cache(maxsize=1)
def get_lstm_model():
    return load_model('models/lstm/lstm_trend_model.keras')
```

### Frontend
```jsx
// Code splitting with React.lazy
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Suspense for loading
<Suspense fallback={<Loader />}>
  <Dashboard />
</Suspense>
```

### Database
```sql
-- Add indexes for faster queries
CREATE INDEX idx_user_symbol ON portfolios(user_id, symbol);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
```

## 🔒 Security Best Practices

### Backend
```python
# Never hardcode secrets
JWT_SECRET = os.getenv('JWT_SECRET', 'change-this')

# Use environment variables
DATABASE_URL = os.getenv('DATABASE_URL')

# Validate inputs
from pydantic import BaseModel, validator

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
```

### Frontend
```javascript
// Don't store sensitive data in localStorage
localStorage.setItem('token', response.data.access_token); // OK

// Don't log sensitive data
console.log(token); // BAD - don't do this
```

### General
- Use HTTPS in production
- Never commit `.env` files
- Rotate secrets regularly
- Keep dependencies updated
- Use SQL parameterized queries (ORM does this)
- Validate all inputs
- Sanitize outputs

## 🆘 Emergency Commands

### Kill All Node Processes
```bash
# Windows
taskkill /F /IM node.exe

# macOS/Linux
killall node
```

### Kill All Python Processes
```bash
# Windows
taskkill /F /IM python.exe

# macOS/Linux
killall python
```

### Reset Frontend Cache
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules
npm install
```

### Reset Backend Cache
```bash
# Clear Python cache and reinstall
cd backend
rm -rf venv
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Completely Reset Database
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS tradevision; CREATE DATABASE tradevision;"
mysql -u root -p tradevision < database/schema.sql
```

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| "Connection refused" | Start MySQL: `net start MySQL80` (Windows) or `brew services start mysql` (macOS) |
| "Port 8000 in use" | Kill process: `lsof -ti:8000 \| xargs kill -9` |
| "Module not found" | Activate venv and reinstall: `pip install -r requirements.txt` |
| "CORS error" | Add frontend URL to CORS_ORIGINS in `.env` |
| "JWT invalid" | Clear localStorage and re-login |
| "Database not found" | Run: `mysql -u root -p tradevision < database/schema.sql` |
| "Model not found" | Ensure `models/lstm/lstm_trend_model.keras` exists |
| "Npm not found" | Install Node.js from https://nodejs.org |
| "Python not found" | Install Python from https://python.org |
| "MySQL not found" | Install MySQL from https://mysql.com |

## 📚 Documentation Map

```
README.md              ← Start here (architecture overview)
SETUP.md              ← Installation and setup
PROJECT_STRUCTURE.md     ← Backend API and ML docs
PROJECT_STRUCTURE.md    ← Frontend component docs
PROJECT_STRUCTURE.md  ← File-by-file breakdown
COMPLETION_SUMMARY.md ← What was built and next steps
QUICK_REFERENCE.md    ← This file (common tasks)
```

---

**Need help? Check the relevant README file or troubleshooting section above!**
