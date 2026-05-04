# backend/routes/settings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/settings")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    """Get admin profile settings"""
    try:
      
        admin = db.query(models.User).filter(models.User.role == "admin").first()
        
        if not admin:
            return {
                "username": "admin",
                "email": "admin@pharmacplus.com",
                "fullName": "Administrator",
                "role": "admin",
                "avatar": None
            }
        
        return {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email if hasattr(admin, 'email') else "admin@pharmacplus.com",
            "fullName": admin.full_name if hasattr(admin, 'full_name') else "Administrator",
            "role": admin.role,
            "avatar": admin.avatar if hasattr(admin, 'avatar') else None
        }
    except Exception as e:
        print(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
def update_profile(profile_data: dict, db: Session = Depends(get_db)):
    """Update admin profile"""
    try:
        admin = db.query(models.User).filter(models.User.role == "admin").first()
        
        if admin:
            if "fullName" in profile_data:
                admin.full_name = profile_data["fullName"]
            if "email" in profile_data:
                admin.email = profile_data["email"]
            if "username" in profile_data:
                admin.username = profile_data["username"]
            admin.updated_at = datetime.now()
            
            db.commit()
        
        return {"message": "Profile updated successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/password")
def update_password(password_data: dict, db: Session = Depends(get_db)):
    """Update admin password"""
    try:
      
        admin = db.query(models.User).filter(models.User.role == "admin").first()
        
        if admin:
           
            if password_data.get("currentPassword") != "admin123":
                raise HTTPException(status_code=400, detail="Current password is incorrect")
            
            if password_data.get("newPassword") != password_data.get("confirmPassword"):
                raise HTTPException(status_code=400, detail="Passwords do not match")
            
            admin.password = password_data["newPassword"]  # Hash this in production!
            db.commit()
        
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating password: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company")
def get_company_settings(db: Session = Depends(get_db)):
    """Get company settings"""
   
    return {
        "companyName": "PHARMAC+",
        "address": "123 Healthcare Street, Medical District",
        "phone": "+880 1234 567890",
        "email": "info@pharmacplus.com",
        "taxRate": 15.0,
        "currency": "BDT",
        "receiptFooter": "Thank you for choosing PHARMAC+!\nThis is a computer generated receipt.",
        "lowStockAlert": 20,
        "expiryAlertDays": 30
    }

@router.put("/company")
def update_company_settings(settings: dict, db: Session = Depends(get_db)):
    """Update company settings"""

    return {"message": "Company settings updated successfully"}

@router.get("/notifications")
def get_notification_settings(db: Session = Depends(get_db)):
    """Get notification preferences"""
    return {
        "emailNotifications": True,
        "lowStockAlerts": True,
        "expiryAlerts": True,
        "dailyReports": False,
        "weeklyReports": True
    }

@router.put("/notifications")
def update_notification_settings(settings: dict, db: Session = Depends(get_db)):
    """Update notification preferences"""
    return {"message": "Notification settings updated successfully"}