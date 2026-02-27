# React Prediction Component Guide

## Overview

The `PredictionDisplay` component integrates with your FastAPI backend to display AI-powered stock predictions with confidence meters, component breakdown, and detailed explanations.

## Architecture

```
React Component (PredictionDisplay)
    ↓
   Axios Client (predictionApi.predict)
    ↓
FastAPI Backend (/predictions/predict)
    ↓
Hybrid Decision Engine
    ↓
Response: Decision + Confidence + Components + Explanation
```

---

## Component Features

### 📊 What It Displays

1. **Trading Decision** (Color-coded)
   - Strong Buy (🎯 Green)
   - Buy (📈 Light Green)
   - Hold (⏸️ Yellow)
   - Avoid (📉 Red)

2. **Confidence Meter** (0-100%)
   - Visual progress bar
   - Percentage display

3. **Analysis Breakdown**
   - Technical (35%)
   - Trend (25%)
   - LSTM (15%)
   - Pattern (15%)
   - Sentiment (10%)

4. **Detailed Explanations**
   - Bulleted list of reasons

5. **Price Info**
   - Latest closing price
   - Timestamp

---

## Installation & Setup

### 1. Component is Already Created
```
frontend/src/components/PredictionDisplay.jsx  ✅
frontend/src/pages/Prediction.jsx              ✅ (Updated)
frontend/src/api/predictionApi.js              ✅ (Existing)
frontend/src/api/axios.js                      ✅ (Configured)
```

### 2. Styling Included
```
frontend/src/index.css  ✅ (All CSS added)
```

### 3. No Additional Installation Needed
- Uses existing Axios setup
- Tailwind CSS compatible
- React 18+ compatible

---

## Basic Usage

### Simple Page Search

```jsx
import { useState } from 'react'
import PredictionDisplay from '../components/PredictionDisplay'

export default function Prediction() {
  const [symbol, setSymbol] = useState('')
  const [searchSymbol, setSearchSymbol] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchSymbol(symbol.toUpperCase())
  }

  return (
    <div className="prediction-page">
      <h1>📈 Stock Prediction Engine</h1>
      
      <form onSubmit={handleSearch}>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g., INFY)"
        />
        <button type="submit">Analyze</button>
      </form>

      <PredictionDisplay symbol={searchSymbol} />
    </div>
  )
}
```

---

## Advanced Usage

### With Data Callback

```jsx
const handlePredictionLoad = (prediction) => {
  console.log('Decision:', prediction.decision)
  console.log('Confidence:', prediction.confidence)
  
  // Save to state
  setLatestPrediction(prediction)
  
  // Send analytics
  trackEvent('prediction_made', {
    symbol: prediction.symbol,
    decision: prediction.decision
  })
}

<PredictionDisplay 
  symbol={symbol}
  onPredictionLoad={handlePredictionLoad}
/>
```

### Multiple Predictions (Watchlist)

```jsx
const [symbols] = useState(['INFY', 'TCS', 'RELIANCE'])

<div className="predictions-grid">
  {symbols.map((sym) => (
    <div key={sym} className="prediction-card-wrapper">
      <h3>{sym}</h3>
      <PredictionDisplay symbol={sym} />
    </div>
  ))}
</div>
```

### Auto-Refresh

```jsx
useEffect(() => {
  // Refresh every 5 minutes
  const interval = setInterval(() => {
    setRefreshKey(k => k + 1)
  }, 5 * 60 * 1000)

  return () => clearInterval(interval)
}, [])

// Add key to force re-fetch
<PredictionDisplay key={refreshKey} symbol={symbol} />
```

---

## API Request Flow

### 1. Component Calls API
```javascript
// File: frontend/src/api/predictionApi.js
predictionApi.predict('INFY')
```

### 2. Axios Sends Request
```javascript
// File: frontend/src/api/axios.js
POST http://localhost:8000/predictions/predict
Headers: {
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
}
Body: {
  symbol: "INFY"
}
```

### 3. Backend Processes
```python
# File: backend/app/api/prediction_routes.py
@router.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictionRequest):
    result = predict_stock(req.symbol)
    # Calls hybrid decision engine
    return result
```

### 4. Component Renders Response
```json
{
  "decision": "Buy",
  "confidence": 72.45,
  "final_score": 65.32,
  "components": {...},
  "explanation": [...]
}
```

---

## Error Handling

Component automatically handles:

### ✅ Loading State
- Shows spinner
- Displays "Analyzing {symbol}..."

### ✅ Error State
- Shows error icon (⚠️)
- Displays error message from backend
- Helpful hint text

### ✅ Empty State
- Shows when no symbol provided
- Prompts user to enter symbol

---

## State Management

The component manages its own state:

```javascript
const [prediction, setPrediction] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

### Trigger re-fetch by:
1. Changing the `symbol` prop
2. Component automatically watches `symbol` with useEffect

---

## Customization

### Change Decision Colors

Edit `getDecisionStyle()` in component:

```jsx
case 'strong buy':
  return { 
    color: '#10b981',  // Green
    icon: '🎯',
    bgClass: 'decision-strong-buy'
  }
```

### Modify Confidence Meter

Edit CSS in `frontend/src/index.css`:

```css
.meter-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
}
```

### Add More Fields

Extend the response display:

```jsx
{prediction.custom_field && (
  <div className="custom-card">
    {prediction.custom_field}
  </div>
)}
```

---

## Testing

### Test in Browser Console

```javascript
// Manually call API
import { predictionApi } from './api/predictionApi'

predictionApi.predict('INFY')
  .then(res => console.log(res.data))
  .catch(err => console.error(err))
```

### Test with cURL

```bash
curl -X POST http://localhost:3000/  # Frontend
curl -X POST http://localhost:8000/predictions/predict \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"INFY"}'
```

---

## Performance Tips

1. **Memoize Callbacks**
   ```jsx
   const handlePredictionLoad = useCallback((pred) => {
     // ...
   }, [])
   ```

2. **Lazy Load Multiple Predictions**
   ```jsx
   {symbols.slice(0, 3).map(sym => (
     <PredictionDisplay symbol={sym} />
   ))}
   ```

3. **Cache Results** (Optional)
   ```jsx
   const [cache, setCache] = useState({})
   ```

4. **Debounce User Input**
   ```jsx
   const debouncedSearch = debounce(handleSearch, 500)
   ```

---

## Troubleshooting

### ❌ Component Shows "Failed to fetch prediction"

Check:
1. Backend is running (`http://localhost:8000`)
2. JWT token is valid (check localStorage)
3. Symbol exists in database
4. No CORS errors (check browser console)

### ❌ "Could not validate credentials"

- Token expired → Login again
- Wrong JWT_SECRET_KEY → Check backend .env

### ❌ No data displays

- Component needs `symbol` prop
- Pass non-empty string: `<PredictionDisplay symbol="INFY" />`

### ❌ Styles not applying

- Check Tailwind CSS is installed
- Verify `index.css` is imported in `main.jsx`
- Clear browser cache (Ctrl+Shift+Delete)

---

## Files Modified

| File | Changes |
|------|---------|
| `PredictionDisplay.jsx` | ✅ NEW - Main component |
| `pages/Prediction.jsx` | ✅ Updated - Uses new component |
| `index.css` | ✅ Updated - Added all styles |
| `predictionApi.js` | ✅ Existing - No changes needed |
| `axios.js` | ✅ Existing - Already configured |

---

## Next Steps

1. ✅ Start frontend: `npm run dev`
2. ✅ Start backend: `uvicorn app.main:app --reload`
3. ✅ Navigate to `http://localhost:5173/prediction`
4. ✅ Enter a stock symbol
5. ✅ See the prediction display!

---

## Real-World Integration Examples

See [PREDICTION_USAGE_GUIDE.md](./PREDICTION_USAGE_GUIDE.md) for:
- Dashboard integration
- Watchlist implementation
- Auto-refresh setup
- Multiple cards layout
- Custom wrappers
- Error boundaries
