from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from datetime import datetime
from .database import Base


class User(Base):
    """User authentication model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Portfolio(Base):
    """User stock portfolio"""
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    symbol = Column(String(20), nullable=False)
    quantity = Column(Float, nullable=False)
    buy_price = Column(Float, nullable=False)
    buy_date = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    """Prediction history"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    decision = Column(String(50), nullable=False)
    score = Column(Float, nullable=False)
    technical_score = Column(Float)
    lstm_score = Column(Float)
    confidence = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class Alert(Base):
    """User price alerts"""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    symbol = Column(String(20), nullable=False)
    threshold = Column(Float, nullable=False)
    direction = Column(String(10), nullable=False)  # 'above' or 'below'
    created_at = Column(DateTime, default=datetime.utcnow)
