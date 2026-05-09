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

# ADD THIS SETUP ENDPOINT
@router.get("/setup")
def setup_default_users(db: Session = Depends(get_db)):
    """Create default admin and cashier users (Run once)"""
    # Create admin user if not exists
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        admin = models.User(
            username="admin",
            password="admin123",
            role="admin",
            email="admin@pharmacplus.com",
            full_name="Administrator",
            is_active=True
        )
        db.add(admin)
        print("Admin user created")
    
    # Create cashier user if not exists
    cashier = db.query(models.User).filter(models.User.username == "cashier").first()
    if not cashier:
        cashier = models.User(
            username="cashier",
            password="cashier123",
            role="cashier",
            email="cashier@pharmacplus.com",
            full_name="Cashier User",
            is_active=True
        )
        db.add(cashier)
        print("Cashier user created")
    
    db.commit()
    
    return {
        "message": "Setup completed successfully",
        "users": [
            {"username": "admin", "password": "admin123", "role": "admin"},
            {"username": "cashier", "password": "cashier123", "role": "cashier"}
        ]
    }