# Quick Start Guide

Follow these steps in order to get the app running with real-time portfolio updates.

## Step 1: Start Backend Server

Open a **NEW terminal** and run:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

Keep this terminal running - DO NOT close it.

## Step 2: Create Test User

Open **another NEW terminal** and run:

```bash
curl http://localhost:8000/api/portfolio/debug/create-test-user
```

Or in PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/portfolio/debug/create-test-user"
```

**Expected response:**
```json
{
  "status": "created",
  "username": "testuser",
  "id": 1
}
```

If you see `"status": "exists"`, the user already exists - that's fine!

## Step 3: Start Frontend Dev Server

Open **another NEW terminal** and run:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Press q to quit
```

## Step 4: Login to Frontend

1. Go to http://localhost:5173 in your browser
2. Click **"Login"**
3. Use one of the following credentials:
   * **Pre‑created demo user**: username `testuser` / password `password123` (created in Step 2)
   * **Or** click **Create Account** and register any new username/password
4. Click **"Sign In →"**
5. You should be redirected to **Dashboard**

**Open DevTools (F12)** and check the Console for these logs:
```
[AuthContext] Logging in user: ...
[AuthContext] Token saved to localStorage
```

## Step 5: Test Real-Time Portfolio Sync

1. Click **"Predictions"** in the left sidebar
2. Wait for stock symbol to load
3. Click **"Show AI Prediction"** button
4. Once prediction loads, click **"BUY"** button
5. Enter:
   - Quantity: `10`
   - Price: `2850`
6. Click **"Confirm Order"** button
7. You should see: ✅ `"BUY order placed for 10 shares..."`
8. **Immediately click "Portfolio"** tab
9. Within **3 seconds**, you should see your new holding appear in the Holdings table

## Monitoring Progress

Watch the browser console (F12) for these log sequences:

### Successful Login Sequence:
```
[Login] Submitting with credentials: {email: "test@example.com"}
[AuthContext] Logging in user: {name: "Trader", email: "test@example.com"}
[AuthContext] Token saved to localStorage
```

### Successful Portfolio Load:
```
[Portfolio] Fetching portfolio data for user: test@example.com
[Axios] Added Authorization header for request: GET /portfolio
[Portfolio] API Response: [...]
[Portfolio] Formatted holdings: [...]
```

### Successful Transaction:
```
[Prediction] Placing BUY order...
[Axios] Added Authorization header for request: POST /portfolio/add
[Portfolio] Portfolio update event received: {symbol: "RELIANCE", action: "BUY"}
[Portfolio] Fetching portfolio data for user: test@example.com
[Portfolio] API Response: [...includes new holding...]
```

## Troubleshooting

### Backend Not Running?
Error: `Failed to load resource: net::ERR_CONNECTION_REFUSED`

**Solution:** Make sure backend terminal is running and shows:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### User is Undefined?
Error: `[Portfolio] Fetching portfolio data for user: undefined`

**Solution:** You haven't logged in yet. Complete Step 4 and check browser console for `[AuthContext]` logs.

### User Not Found Error in Backend?
Error: `[Portfolio] User not found: test@example.com`

**Solution:** The test user needs to be created. Run Step 2 again.

### Portfolio Still Empty After Buy Order?
1. Check browser console (F12) for `[Portfolio]` logs
2. Check backend terminal for `[Portfolio]` logs
3. Verify order succeeded with toast notification
4. Wait 3-5 seconds (polling interval)
5. Check Network tab (DevTools) to see API response status codes

## All 3 Terminals Should Be Running

```
Terminal 1: Backend (uvicorn)
Terminal 2: (keeps running after test user creation)
Terminal 3: Frontend (npm run dev)
```

Keep all three running during testing!

## Next Steps

- Portfolio updates every 3 seconds automatically
- After buy/sell, also updates immediately via event dispatch
- Check DEBUGGING_GUIDE.md for advanced troubleshooting
- All logs follow `[ComponentName]` prefix pattern for easy tracking
