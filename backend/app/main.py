from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, prediction_routes, portfolio_routes, news_routes, alert_routes, advisor_routes, education_routes
from .database import Base, engine
from .utils.logger import logger
import os
import json

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TradeVision AI Backend",
    description="AI-powered stock prediction and trading advisor",
    version="1.0.0"
)

# CORS middleware
def get_cors_origins():
    """Parse CORS_ORIGINS from env, supporting both JSON array and comma-separated formats"""
    cors_str = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5173")
    try:
        # Try parsing as JSON array first
        origins = json.loads(cors_str)
        return origins if isinstance(origins, list) else [cors_str]
    except (json.JSONDecodeError, TypeError):
        # Fall back to comma-separated format
        return [o.strip() for o in cors_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under an "/api" namespace for consistency with frontend
app.include_router(auth.router, prefix="/api")
app.include_router(prediction_routes.router, prefix="/api")
app.include_router(portfolio_routes.router, prefix="/api")
app.include_router(news_routes.router, prefix="/api")
app.include_router(alert_routes.router, prefix="/api")
app.include_router(advisor_routes.router, prefix="/api")
app.include_router(education_routes.router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "TradeVision AI Backend",
        "version": "1.0.0"
    }


@app.on_event("startup")
async def startup_event():
    """Run on app startup"""
    logger.info("TradeVision AI Backend started")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on app shutdown"""
    logger.info("TradeVision AI Backend shutting down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
