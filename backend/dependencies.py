
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import secrets


tokens = {}

security = HTTPBearer()

def generate_token() -> str:
    """Generate a secure token"""
    return secrets.token_urlsafe(32)

def create_session(user_id: int, username: str, role: str):
    """Create a new session token"""
    token = generate_token()
    tokens[token] = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "expires": datetime.now() + timedelta(days=1)
    }
    return token

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token"""
    token = credentials.credentials
    
    if token not in tokens:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token_data = tokens[token]
    if token_data["expires"] < datetime.now():
        del tokens[token]
        raise HTTPException(status_code=401, detail="Token expired")
    
    return token_data

def require_admin(current_user: dict = Depends(get_current_user)):
    """Require admin role"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def require_cashier(current_user: dict = Depends(get_current_user)):
    """Require cashier or admin role"""
    if current_user["role"] not in ["cashier", "admin"]:
        raise HTTPException(status_code=403, detail="Cashier access required")
    return current_user