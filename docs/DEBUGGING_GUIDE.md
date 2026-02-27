# Debugging & Testing Guide

This guide helps you troubleshoot real-time portfolio updates and trace the transaction flow through detailed logging.

## Quick Start: Test the Complete Flow

### Step 1: Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Create Test User (Required)
In a new terminal or browser, call:
```bash
curl http://localhost:8000/api/portfolio/debug/create-test-user
```

Expected response:
```json
{
  "status": "created",
  "username": "testuser",
  "id": 123
}
```

### Step 3: Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Login to Frontend
- Navigate to http://localhost:5173
- Click **Login**
- For this test, use any email (e.g., `test@example.com`)
- Password can be anything
- Click **Login** button
- You should be redirected to Dashboard

### Step 5: Test Portfolio Update (Real-Time Sync)
1. Navigate to **"Predictions"** page
2. Select a stock symbol in the dropdown (e.g., "RELIANCE")
3. Click **"Show AI Prediction"**
4. Once prediction loads, click **"BUY"** button
5. Enter:
   - Quantity: `10`
   - Price: `2850`
6. Click **"Confirm Order"**
7. Expect toast notification: `"BUY order placed for 10 shares..."`
8. Navigate immediately to **"Portfolio"** page
9. **Within 3 seconds**, you should see your new holding appear in the table

## Debugging: Check Console Logs

Open browser DevTools with **F12** and check the Console tab.

### Expected Log Sequence (Successful Flow)

#### 1. Login Phase
```
[Login] Submitting with credentials: {email: "test@example.com"}
[AuthContext] Logging in user: {name: "Trader", email: "test@example.com"}
[AuthContext] Token received: demo-token-12...
[AuthContext] Token saved to localStorage
[AuthContext] User saved to localStorage
```

#### 2. Portfolio Page Load
```
[Axios] Added Authorization header for request: GET http://localhost:8000/api/portfolio/
[Portfolio] Fetching portfolio data for user: test@example.com
[Portfolio] API Response: [ { symbol: "RELIANCE", quantity: 10, buy_price: 2850 }, ... ]
[Portfolio] Formatted holdings: [ { symbol: "RELIANCE", qty: 10, avg: 2850, ... }, ... ]
[Axios] Added Authorization header for request: GET http://localhost:8000/api/portfolio/risk
[Portfolio] Risk analysis: { diversification_score: 0.95, volatility_risk: 0.12, allocation_imbalance: 0.05 }
```

#### 3. Transaction (Prediction → Buy → Portfolio)
```
[Prediction] Placing BUY order...
[Axios] Added Authorization header for request: POST http://localhost:8000/api/portfolio/add
[Transaction] API Response: {status: "added", item: {symbol: "RELIANCE", quantity: 10, ...}}
[Transaction] Waiting 500ms for backend persistence...
[Portfolio] Portfolio update event received: {symbol: "RELIANCE", action: "BUY"}
[Portfolio] Fetching portfolio data for user: test@example.com
[Portfolio] API Response: [ { symbol: "RELIANCE", quantity: 10, ... }, ... ]
```

## Backend Logs

Check backend terminal for corresponding server-side logs:

### Expected Backend Log Sequence

#### 1. Add Stock Request
```
[Portfolio] Adding stock for user: testuser
[Portfolio] User found: 1, adding 10 shares of RELIANCE
[Portfolio] Stock added successfully: RELIANCE
```

#### 2. Get Portfolio Request
```
[Portfolio] Fetching portfolio for user: testuser
[Portfolio] User found: 1
[Portfolio] Found 1 portfolio items for user 1
```

#### 3. Get Risk Analysis Request
```
[Portfolio] Computing risk analysis for user: testuser
[Portfolio] User found: 1
[Portfolio] Found 1 holdings for user 1
[Portfolio] Risk analysis computed: {...}
```

## Common Issues & Solutions

### Issue 1: "User 'X' not found" Error

**Symptom:** 
- Browser console shows 404 errors
- Backend logs: `[Portfolio] User not found: demo@email.com`

**Cause:** The login flow creates a JWT token but doesn't create an actual user in the database.

**Solution:** Call the test user creation endpoint FIRST before testing:
```bash
curl http://localhost:8000/api/portfolio/debug/create-test-user
```

Then verify user was created by checking database:
```python
# In backend terminal
from app.models import User
from app.database import SessionLocal
db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"Username: {u.username}, ID: {u.id}")
```

### Issue 2: Token Not Found in localStorage

**Symptom:**
- Browser console shows: `[Axios] No token found in localStorage`
- API calls fail with 401 Unauthorized

**Cause:** Token not being saved during login

**Solution:** Check AuthContext logs:
1. Open DevTools Console (F12)
2. Login again
3. Look for: `[AuthContext] Token saved to localStorage`
4. Verify: `localStorage.getItem('token')` returns a token string

### Issue 3: Portfolio Not Updating After Transaction

**Symptom:**
- Buy/sell order succeeds (toast shows success)
- Portfolio page doesn't show new holding
- No "portfolioUpdated" event logs

**Cause:** Event dispatch timing or polling interval too long

**Solution:**
1. Check browser logs for: `[Portfolio] Portfolio update event received`
2. If missing, check Prediction.jsx handleTransactionSubmit logs
3. Verify 500ms delay is happening: `[Transaction] Waiting 500ms...`
4. If still not working, manually trigger fetch:
   ```javascript
   // In browser console
   window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: { symbol: 'RELIANCE', action: 'BUY' } }));
   ```

### Issue 4: Slow Updates (Taking More Than 3 Seconds)

**Symptom:** Portfolio page updates slowly after transaction

**Cause:** Network latency or slow backend response

**Solution:**
1. Check network tab (DevTools Network tab)
2. Look for slow API calls: `/api/portfolio/` or `/api/portfolio/add`
3. Monitor backend response times in logs
4. Reduce polling interval in Portfolio.jsx if needed (currently 3000ms)

### Issue 5: Risk Analysis Not Showing

**Symptom:**
- Portfolio shows but Risk Analysis card displays zeros
- No risk data from API

**Cause:** No holdings in portfolio (can't analyze empty portfolio)

**Solution:**
1. Add at least one stock to portfolio first
2. Check logs: `[Portfolio] Found 0 portfolio items for user 1` means portfolio is empty
3. Risk analysis will only show meaningful values after adding stocks

## Database Verification

### Check if User Exists
```python
from app.models import User
from app.database import SessionLocal

db = SessionLocal()
user = db.query(User).filter(User.username == "testuser").first()
if user:
    print(f"User exists: {user.username} (ID: {user.id})")
else:
    print("User not found")
db.close()
```

### Check if Portfolio Has Holdings
```python
from app.models import Portfolio
from app.database import SessionLocal

db = SessionLocal()
holdings = db.query(Portfolio).filter(Portfolio.user_id == 1).all()
print(f"Holdings: {[(h.symbol, h.quantity) for h in holdings]}")
db.close()
```

### Check Supabase Connection
```python
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT NOW()"))
    print(result.fetchone())
```

## Monitoring Checklist

Before running the test, verify:
- [ ] Backend server running on port 8000
- [ ] Frontend running on port 5173
- [ ] Test user created via `/api/portfolio/debug/create-test-user`
- [ ] Browser DevTools Console open (F12)
- [ ] Backend terminal visible to watch logs
- [ ] Network tab in DevTools ready to monitor API calls
- [ ] localStorage cleared (optional, but helps): 
  ```javascript
  localStorage.clear(); 
  location.reload();
  ```

## Real-Time Sync Timeline

For a successful transaction that updates portfolio in real-time:

| Time | Component | Action |
|------|-----------|--------|
| T+0ms | Prediction | User clicks "BUY" button |
| T+50ms | Frontend | Form validation |
| T+100ms | Frontend | POST /api/portfolio/add |
| T+200ms | Backend | User lookup, create Portfolio entry |
| T+250ms | Backend | Response sent (status: "added") |
| T+300ms | Frontend | Call portfolioApi.addStock() succeeds |
| T+400ms | Frontend | Toast notification shown |
| T+500ms | Frontend | 500ms delay ⏳ |
| T+600ms | Frontend | Custom event "portfolioUpdated" dispatched |
| T+650ms | Portfolio | Event listener triggered, fetchPortfolioData() called |
| T+700ms | Frontend | GET /api/portfolio/ request sent |
| T+800ms | Backend | User lookup, query Portfolio entries |
| T+900ms | Backend | Risk analysis computed |
| T+1000ms | Backend | Response sent with updated holdings |
| T+1100ms | Frontend | API response received, state updated |
| T+1150ms | Frontend | UI re-renders with new holding ✅ |

**Target:** UI update visible within **1-2 seconds** of clicking "Confirm Order"

## Performance Optimization Tips

1. **Reduce Polling Interval** (if < 3s acceptable):
   - frontend/src/pages/Portfolio.jsx line ~80
   - Change `3000` to `2000` for more frequent checks

2. **Skip Polling During Event Dispatch**:
   - Modify Portfolio.jsx to pause polling when event received
   - Prevents redundant fetches

3. **Cache Risk Analysis**:
   - Risk analysis doesn't change frequently
   - Fetch less often (e.g., every 6 seconds instead of 3)

4. **Batch API Calls**:
   - Combine `/portfolio` and `/portfolio/risk` into single endpoint
   - Reduces network roundtrips

## Test Scenarios

### Scenario 1: Single Stock Purchase
- [ ] Login
- [ ] Go to Predictions
- [ ] Select RELIANCE
- [ ] Click BUY
- [ ] Enter qty: 10, price: 2850
- [ ] Confirm
- [ ] Check Portfolio (should appear within 3 seconds)

### Scenario 2: Multiple Stocks
- [ ] Repeat above with TCS, then INFY, then WIPRO
- [ ] Portfolio should show all 4 holdings
- [ ] Risk scores should change with each addition

### Scenario 3: Page Refresh Persistence
- [ ] Add stock to portfolio
- [ ] Refresh browser (Ctrl+R)
- [ ] Stock should still appear (persisted in database)

### Scenario 4: Multiple Tabs
- [ ] Open Portfolio in Tab A
- [ ] Open Predictions in Tab B
- [ ] Buy stock from Tab B
- [ ] Tab A should auto-update within 3 seconds (via polling or event)

## Need More Help?

1. **Check logs first** - Most issues show clear error messages in logs
2. **Network tab** - DevTools Network tab shows API call details
3. **Database state** - Verify data exists in database
4. **Backend terminal** - Watch live logs as you perform actions
5. **Browser console** - All frontend activity logged with [Component] prefix

Happy debugging! 🐛
