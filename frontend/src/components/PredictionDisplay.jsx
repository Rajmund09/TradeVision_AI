/**
 * PredictionDisplay Component
 *
 * Fetches stock prediction from backend and displays:
 * - Trading decision (Buy/Hold/Avoid)
 * - Confidence percentage with visual meter
 * - Detailed explanation list
 * - Component breakdown (technical, trend, etc.)
 *
 * Usage:
 *   <PredictionDisplay symbol="INFY" />
 */

import React, { useState, useEffect } from 'react'
import { predictionApi } from '../api/predictionApi'
import { ConfidenceMeter } from './ConfidenceMeter'

export const PredictionDisplay = ({ symbol, onPredictionLoad }) => {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch prediction when symbol changes
  useEffect(() => {
    if (!symbol || symbol.trim() === '') {
      setPrediction(null)
      return
    }

    const fetchPrediction = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await predictionApi.predict(symbol)
        setPrediction(response.data)
        // Callback for parent components
        if (onPredictionLoad) {
          onPredictionLoad(response.data)
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch prediction')
        console.error('Prediction error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [symbol, onPredictionLoad])

  // Loading state
  if (loading) {
    return (
      <div className="prediction-container loading">
        <div className="loader-spinner"></div>
        <p>Analyzing {symbol}...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="prediction-container error">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <small>Check that the symbol exists and has available data.</small>
      </div>
    )
  }

  // No data state
  if (!prediction) {
    return (
      <div className="prediction-container empty">
        <p>Enter a stock symbol to get started</p>
      </div>
    )
  }

  // Get decision color and icon
  const getDecisionStyle = (decision) => {
    switch (decision?.toLowerCase()) {
      case 'strong buy':
        return { color: '#10b981', icon: '🎯', bgClass: 'decision-strong-buy' }
      case 'buy':
        return { color: '#34d399', icon: '📈', bgClass: 'decision-buy' }
      case 'hold':
        return { color: '#f59e0b', icon: '⏸️', bgClass: 'decision-hold' }
      case 'avoid':
        return { color: '#ef4444', icon: '📉', bgClass: 'decision-avoid' }
      default:
        return { color: '#6b7280', icon: '❓', bgClass: 'decision-unknown' }
    }
  }

  const decisionStyle = getDecisionStyle(prediction.decision)

  return (
    <div className="prediction-container">
      {/* Decision Card */}
      <div className={`prediction-card decision-card ${decisionStyle.bgClass}`}>
        <div className="decision-content">
          <div className="decision-icon">{decisionStyle.icon}</div>
          <div className="decision-text">
            <p className="decision-label">Trading Decision</p>
            <h2 className="decision-value" style={{ color: decisionStyle.color }}>
              {prediction.decision}
            </h2>
          </div>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="prediction-card confidence-card">
        <p className="card-label">Confidence Level</p>
        <ConfidenceMeter confidence={prediction.confidence} />
        <div className="confidence-details">
          <small>Overall Score: {prediction.final_score}/100</small>
        </div>
      </div>

      {/* Component Breakdown */}
      {prediction.components && (
        <div className="prediction-card components-card">
          <p className="card-label">Analysis Breakdown</p>
          <div className="components-grid">
            {Object.entries(prediction.components).map(([key, data]) => {
              // Skip risk if weight is 0
              if (data.weight === 0) return null
              return (
                <div key={key} className="component-item">
                  <div className="component-header">
                    <span className="component-name">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className="component-weight">
                      {(data.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="component-bar">
                    <div
                      className="component-fill"
                      style={{
                        width: `${Math.min(data.score, 100)}%`,
                        backgroundColor:
                          data.score >= 60 ? '#10b981' : data.score >= 40 ? '#f59e0b' : '#ef4444'
                      }}
                    ></div>
                  </div>
                  <span className="component-score">{data.score.toFixed(1)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Explanation List */}
      {prediction.explanation && prediction.explanation.length > 0 && (
        <div className="prediction-card explanation-card">
          <p className="card-label">Analysis Details</p>
          <ul className="explanation-list">
            {prediction.explanation.map((item, idx) => (
              <li key={idx} className="explanation-item">
                <span className="bullet">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Info */}
      {prediction.latest_price && (
        <div className="prediction-card price-card">
          <p className="card-label">Latest Price</p>
          <p className="price-value">₹{prediction.latest_price.toFixed(2)}</p>
          <small className="price-timestamp">Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
      )}
    </div>
  )
}

export default PredictionDisplay
