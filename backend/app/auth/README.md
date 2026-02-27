# JWT Authentication Guide

## Overview

TradeVision AI uses **JWT (JSON Web Tokens)** for stateless authentication. This guide covers:
- How JWT authentication works
- Token generation and verification
- How to protect routes
- Security best practices

---

## Architecture

### Components

1. **password_utils.py** – Password hashing with bcrypt
2. **jwt_handler.py** – Token creation and verification with `get_current_user` dependency
3. **auth_service.py** – Business logic for registration and login
4. **auth.py routes** – Public `/auth/register` and `/auth/login` endpoints

### Flow

```
User Registration
├─ POST /auth/register
│  ├─ Validate username/password (Pydantic)
│  ├─ Check username uniqueness
│  ├─ Hash password with bcrypt
│  └─ Store in database

User Login
├─ POST /auth/login
│  ├─ Lookup user by username
│  ├─ Verify password (bcrypt compare)
│  ├─ Generate JWT token (expires in 24h)
│  └─ Return {"access_token": "...", "token_type": "bearer"}

Protected Routes
├─ GET /protected/me (with Authorization header)
│  ├─ Extract token from "Authorization: Bearer <token>"
│  ├─ Verify token signature and expiration
│  ├─ Extract username from "sub" claim
│  └─ Call route handler with current_user
```

---

## Implementation Details

### 1. Password Hashing (bcrypt)

**File:** `backend/app/auth/password_utils.py`

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(password: str) -> str:
    """Hash password with salt"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time comparison prevents timing attacks"""
    return pwd_context.verify(plain, hashed)
```

**Why bcrypt:**
- Automatically generates salts
- Adaptive (rounds can be increased over time)
- Resistant to GPU attacks (computation cost)
- Constant-time comparison

### 2. JWT Token Management

**File:** `backend/app/auth/jwt_handler.py`

```python
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from fastapi import Depends, HTTPException, status

# HTTP Bearer extracts from "Authorization: Bearer <token>"
security = HTTPBearer()

def create_access_token(data: dict) -> str:
    """Create JWT with 24h expiration"""
    expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode = {**data, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    """Dependency for protected routes"""
    token = credentials.credentials
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=403, detail="Invalid token")
    return username
```

### 3. Login Route

**File:** `backend/app/api/auth.py`

```python
@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login and get JWT token.
    
    Request: form-encoded (username, password)
    Response: {"access_token": "...", "token_type": "bearer"}
    """
    result = authenticate_user(db, form_data.username, form_data.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result
```

---

## Usage Examples

### Register

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure_password"}'
```

Response:
```json
{
  "id": 1,
  "username": "john_doe"
}
```

### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john_doe&password=secure_password"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsImV4cCI6MTcwODk0NzIwMH0.signature",
  "token_type": "bearer"
}
```

### Use Token on Protected Route

```bash
curl -X GET http://localhost:8000/protected/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:
```json
{
  "username": "john_doe"
}
```

### Without Token (Fails)

```bash
curl -X GET http://localhost:8000/protected/me

# Returns 403 Forbidden
```

---

## Protected Routes

Use the `get_current_user` dependency to protect routes:

```python
from fastapi import APIRouter, Depends
from app.auth.jwt_handler import get_current_user

router = APIRouter()

@router.get("/protected")
async def protected_endpoint(current_user: str = Depends(get_current_user)):
    return {"user": current_user, "data": "Only authenticated users see this"}
```

---

## Configuration

**File:** `.env`

```env
# CRITICAL: Change this to a strong random value!
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production

# Token lifetime
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
```

### Generate a Strong Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Security Best Practices

### ✅ Implemented

- **Bcrypt hashing** (12 rounds) – immune to GPU attacks
- **Constant-time password comparison** – timing attack resistant
- **JWT signature verification** – prevents token tampering
- **Token expiration** (24 hours) – limits exposure window
- **HTTP Bearer scheme** – standardized token transmission
- **HTTPS-only in production** – prevents token interception

### 🔒 Recommendations for Production

1. **Use strong SECRET_KEY** (40+ char random string)
2. **Enable HTTPS** (redirect HTTP to HTTPS)
3. **Set secure HTTP headers:**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. **Add token refresh tokens** (separate 7-day refresh token)
5. **Implement token blacklist** (Redis) for logout
6. **Add rate limiting** on `/auth/login`
7. **Monitor failed login attempts**
8. **Force HTTPS cookies only:**
   ```python
   response.set_cookie(
       "token",
       token,
       secure=True,      # HTTPS only
       httponly=True,    # No JS access
       samesite="Lax"    # CSRF protection
   )
   ```

---

## JWT Token Structure

Tokens have three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJqb2huX2RvZSIsImV4cCI6MTcwODk0NzIwMH0.
signature
│                                              │
├─ Header (base64)                            ├─ Payload (base64)
│  {"alg":"HS256","typ":"JWT"}                │  {"sub":"john_doe","exp":1708947200}
│                                              │
│                                              └─ Signature (HMAC-SHA256 of header.payload)
```

Decode online at [jwt.io](https://jwt.io) (but never in production!)

---

## Troubleshooting

### "Could not validate credentials" (403)

- Token is expired (check `exp` claim)
- Token signature is invalid (SECRET_KEY mismatch)
- Bearer token format is wrong (missing "Bearer " prefix)

### "Incorrect username or password" (401)

- Username doesn't exist
- Password is wrong
- Username/password in login request body

### Token Issues

Check with:
```bash
python -c "from app.auth.jwt_handler import verify_token; print(verify_token('your-token'))"
```

---

## Related Files

- [password_utils.py](./password_utils.py) – Bcrypt hashing
- [jwt_handler.py](./jwt_handler.py) – Token creation/verification
- [auth_service.py](./auth_service.py) – Login/register business logic
- [auth.py](../api/auth.py) – Public routes
- [protected_routes_example.py](../api/protected_routes_example.py) – Example protected endpoints
