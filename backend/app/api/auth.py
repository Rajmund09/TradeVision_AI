"""Authentication routes for user registration and login.

Endpoints:
- POST /auth/register - Create a new user account
- POST /auth/login - Login and get JWT access token
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .. import database
from ..auth.auth_service import register_user, authenticate_user
from ..schemas import UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginResponse(BaseModel):
    """Token response on successful login"""
    access_token: str
    token_type: str = "bearer"

    class Config:
        example = {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer"
        }


@router.post("/register", response_model=UserOut, status_code=201)
async def register(user_in: UserCreate, db: Session = Depends(database.get_db)):
    """Register a new user.

    Request body: {"username": "john_doe", "password": "secure_password"}
    
    Returns:
        UserOut: newly created user (id and username)
        
    Raises:
        409 Conflict: username already exists
        400 Bad Request: validation error (username/password format)
    """
    result = register_user(db, user_in.username, user_in.password)
    if "error" in result:
        # username conflict maps to 409, others to 400
        code = 409 if "exists" in result["error"].lower() else 400
        raise HTTPException(status_code=code, detail=result["error"])
    return result


@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    """Login user and get JWT access token.

    Request body (form-encoded):
        username: user's username
        password: user's password
        
    Returns:
        LoginResponse: JWT access token and token type
        
    Raises:
        401 Unauthorized: invalid username or password
        
    Usage:
        Authorization: Bearer <access_token>
    """
    result = authenticate_user(db, form_data.username, form_data.password)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return result

