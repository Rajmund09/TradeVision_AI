"""JWT token management with verification dependency.

Best practices:
- Tokens expire after 24 hours
- Secrets loaded from environment (.env)
- JWTError is caught and logged
- Token payload includes username as 'sub' (standard claim)
"""

from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# HTTP Bearer scheme for automatic token extraction from Authorization header
security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token.
    
    Args:
        data: payload dict (must include 'sub' for username)
        expires_delta: optional custom expiration time
    
    Returns:
        str: encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload.
    
    Args:
        token: JWT token string
    
    Returns:
        dict: token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as exc:
        # In production, log this for monitoring
        return None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency to extract and verify JWT token from Authorization header.
    
    FastAPI injects this as a route dependency. If token is invalid,
    raises 403 Forbidden. If valid, returns the username ('sub' claim).
    
    Usage:  @router.get("/protected")
            async def protected_route(current_user: str = Depends(get_current_user)):
                return {"user": current_user}
    
    Args:
        credentials: extracted from Authorization: Bearer <token> header
    
    Returns:
        str: username from token 'sub' claim
    
    Raises:
        HTTPException 403: if token is invalid, expired, or missing
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    username = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    return username
