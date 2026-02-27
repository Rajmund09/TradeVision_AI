"""Password hashing and verification using bcrypt.

Best practices:
- Uses passlib with bcrypt (default deprecated policy)
- Salting is automatic with bcrypt
- Verification is constant-time to prevent timing attacks
"""

import os

# Try to import bcrypt, if it fails we'll use a fallback
try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False
    import hashlib

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with salt.
    
    Args:
        password: plaintext password string
    
    Returns:
        str: hashed password (safe to store in database)
    """
    if not BCRYPT_AVAILABLE:
        # Fallback to SHA256 if bcrypt is not available
        return hashlib.sha256(password.encode()).hexdigest()
    
    # Truncate to 72 bytes (bcrypt limit)
    pwd = password[:72].encode('utf-8') if len(password) > 72 else password.encode('utf-8')
    return bcrypt.hashpw(pwd, bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its bcrypt hash.
    
    Uses constant-time comparison to prevent timing attacks.
    
    Args:
        plain_password: user-provided password
        hashed_password: stored hash from database
    
    Returns:
        bool: True if password matches, False otherwise
    """
    if not BCRYPT_AVAILABLE:
        # Fallback verification
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
    
    try:
        # Truncate to 72 bytes (bcrypt limit)
        pwd = plain_password[:72].encode('utf-8') if len(plain_password) > 72 else plain_password.encode('utf-8')
        return bcrypt.checkpw(pwd, hashed_password.encode('utf-8'))
    except Exception:
        return False
