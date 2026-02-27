# Confidence engine - calculates prediction confidence
import numpy as np


def calculate_confidence(technical_score, lstm_prob, historical_accuracy=0.75):
    """
    Calculate confidence level based on:
    - Confidence of technical indicators
    - LSTM model uncertainty
    - Historical model accuracy
    """
    
    # Technical confidence based on indicator agreement
    tech_confidence = min(abs(technical_score) / 100, 1.0)
    
    # LSTM confidence based on how far probability is from 0.5
    lstm_confidence = abs(lstm_prob - 0.5) * 2
    
    # Combined confidence
    combined_confidence = (tech_confidence * 0.6) + (lstm_confidence * 0.4)
    combined_confidence *= historical_accuracy
    
    # Convert to percentage
    confidence_pct = round(combined_confidence * 100, 2)
    
    return {
        "overall_confidence": confidence_pct,
        "technical_confidence": round(tech_confidence * 100, 2),
        "lstm_confidence": round(lstm_confidence * 100, 2),
        "confidence_level": _get_confidence_label(confidence_pct)
    }


def _get_confidence_label(confidence_pct):
    """Get human-readable confidence label"""
    if confidence_pct >= 80:
        return "Very High"
    elif confidence_pct >= 60:
        return "High"
    elif confidence_pct >= 40:
        return "Medium"
    elif confidence_pct >= 20:
        return "Low"
    else:
        return "Very Low"
