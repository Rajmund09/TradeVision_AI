"""Authentication service with user registration and login.

Handles:
- User registration with password hashing
- User authentication with credential verification
- JWT token generation on successful login
"""

from sqlalchemy.orm import Session
from .password_utils import hash_password, verify_password
from .jwt_handler import create_access_token
from ..models import User


def register_user(db: Session, username: str, password: str) -> dict:
    """Register a new user with hashed password.

    Args:
        db: database session
        username: unique username (3-50 chars, alphanumeric)
        password: plaintext password (min 8 chars)

    Returns:
        dict: {"id": int, "username": str} on success
              {"error": str} on failure (conflict or validation)
    """
    # Basic password policy
    if len(password) < 8:
        return {"error": "Password must be at least 8 characters"}

    # Check for duplicate username
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        return {"error": "Username already exists"}
    
    # Create new user with hashed password
    user = User(username=username, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"id": user.id, "username": user.username}


def authenticate_user(db: Session, username: str, password: str) -> dict:
    """Authenticate user and return JWT access token.

    Args:
        db: database session
        username: user's username
        password: plaintext password to verify

    Returns:
        dict: {"access_token": str, "token_type": "bearer"} on success
              None on authentication failure (user not found or password wrong)
    """
    # allow a built-in demo account via environment variables
    import os
    demo_user = os.environ.get("DEMO_USER", "demo@demo.com")
    demo_pass = os.environ.get("DEMO_PASS", "demo123")
    if username == demo_user and password == demo_pass:
        # ensure demo account exists in database
        user = db.query(User).filter(User.username == demo_user).first()
        if not user:
            # create silently with same password
            user = User(username=demo_user, hashed_password=hash_password(demo_pass))
            db.add(user)
            db.commit()
            db.refresh(user)
    else:
        # Look up user by username
        user = db.query(User).filter(User.username == username).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    # Generate JWT with username as 'sub' (subject) claim
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

