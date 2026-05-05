
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from dependencies import create_session, tokens

router = APIRouter(prefix="/auth")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(models.User).filter(
        models.User.username == username,
        models.User.is_active == True
    ).first()
    
    if not user or user.password != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session
    token = create_session(user.id, user.username, user.role)
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "full_name": user.full_name or user.username
        }
    }

@router.post("/logout")
def logout(token: str):
    """Logout user"""
    if token in tokens:
        del tokens[token]
    return {"success": True}