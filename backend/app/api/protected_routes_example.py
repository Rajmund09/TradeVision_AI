"""
Example: Protected routes using JWT authentication.

Shows how to use the get_current_user dependency to protect routes
and ensure only authenticated users can access them.
"""

from fastapi import APIRouter, Depends
from ..auth.jwt_handler import get_current_user

router = APIRouter(prefix="/protected", tags=["protected"])


@router.get("/me")
async def get_current_user_info(current_user: str = Depends(get_current_user)):
    """Get information about the currently authenticated user.
    
    Requires: Authorization header with valid JWT token
    
    Example:
        GET /protected/me
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        
    Response:
        {"username": "john_doe"}
    """
    return {"username": current_user}


@router.get("/profile")
async def get_profile(current_user: str = Depends(get_current_user)):
    """Get the profile of the currently authenticated user.
    
    This is an example of a protected endpoint. The get_current_user
    dependency will:
    
    1. Extract the JWT token from Authorization header
    2. Verify the token signature and expiration
    3. Return the username if valid
    4. Raise 403 Forbidden if invalid/expired
    
    Requires: Authorization header with valid JWT token
    """
    return {
        "username": current_user,
        "profile": f"Profile for {current_user}",
        "authenticated": True,
    }


@router.delete("/logout")
async def logout(current_user: str = Depends(get_current_user)):
    """Logout the current user (token invalidation).
    
    Note: In a simple JWT setup, tokens are stateless so logout is
    client-side (remove token from localStorage). This endpoint is
    mainly for logging/audit purposes.
    
    For production, consider:
    - Token blacklist (Redis): add token to set on logout
    - Short token expiration
    - Refresh tokens (separate long expiry)
    """
    return {
        "message": f"User {current_user} logged out successfully",
        "action": "Remove token from client storage"
    }


# ============================================================
# USAGE EXAMPLES
# ============================================================

"""
How to test protected routes with curl:

1. Register a user:
   curl -X POST http://localhost:8000/auth/register \\
     -H "Content-Type: application/json" \\
     -d {"username":"john_doe","password":"secure_password"}

2. Login to get token:
   curl -X POST http://localhost:8000/auth/login \\
     -H "Content-Type: application/x-www-form-urlencoded" \\
     -d "username=john_doe&password=secure_password"
   
   Response:
   {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","token_type":"bearer"}

3. Use token on protected endpoint:
   curl -X GET http://localhost:8000/protected/me \\
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   
   Response:
   {"username":"john_doe"}

4. Without token (should fail):
   curl -X GET http://localhost:8000/protected/me
   
   Response:
   {"detail":"Not authenticated"}
"""
