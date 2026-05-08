from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
import models
from datetime import datetime
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/medicines")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_medicines(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user) 
):
    """Get all medicines - Accessible by all logged-in users"""
    meds = db.query(models.Medicine).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "category": m.category,
            "batch": m.batch if m.batch else "",
            "stock": m.stock,  # This is already an Integer
            "expiry": m.expiry.isoformat() if m.expiry else None,
            "sell_price": float(m.sell_price) if m.sell_price else 0.0,  # Ensure float
            "buy_price": float(m.buy_price) if m.buy_price else 0.0,     # Ensure float
            "minStock": m.min_stock,
        }
        for m in meds
    ]


@router.post("/")
def create_medicine(
    medicine: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)  
):
    """Create medicine - Admin only"""
    try:
        med = models.Medicine(
            name=medicine.get("name"),
            category=medicine.get("category", ""),
            batch=medicine.get("batch", ""),
            stock=int(medicine.get("stock", 0)),
            expiry=datetime.strptime(medicine.get("expiry"), "%Y-%m-%d").date() if medicine.get("expiry") and medicine.get("expiry") != "" else None,
            sell_price=float(medicine.get("price", 0) or medicine.get("sell_price", 0)),
            buy_price=float(medicine.get("purchasePrice", 0) or medicine.get("buy_price", 0)),
            min_stock=int(medicine.get("minStock", 20))
        )
        db.add(med)
        db.commit()
        db.refresh(med)
        
        return {
            "id": med.id,
            "name": med.name,
            "category": med.category,
            "batch": med.batch,
            "stock": med.stock,
            "expiry": med.expiry.isoformat() if med.expiry else None,
            "sell_price": float(med.sell_price),
            "buy_price": float(med.buy_price),
            "minStock": med.min_stock
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating medicine: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}")
def update_medicine(
    id: int,
    medicine: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin) 
):
    """Update medicine - Admin only"""
    try:
        med = db.query(models.Medicine).filter(models.Medicine.id == id).first()
        if not med:
            raise HTTPException(status_code=404, detail="Medicine not found")
        
        med.name = medicine.get("name", med.name)
        med.category = medicine.get("category", med.category)
        med.batch = medicine.get("batch", med.batch)
        med.stock = int(medicine.get("stock", med.stock))
        med.sell_price = float(medicine.get("price", med.sell_price) or medicine.get("sell_price", med.sell_price))
        med.buy_price = float(medicine.get("purchasePrice", med.buy_price) or medicine.get("buy_price", med.buy_price))
        med.min_stock = int(medicine.get("minStock", med.min_stock))
        
        if medicine.get("expiry"):
            med.expiry = datetime.strptime(medicine.get("expiry"), "%Y-%m-%d").date()
        
        db.commit()
        db.refresh(med)
        
        return {
            "id": med.id,
            "name": med.name,
            "category": med.category,
            "batch": med.batch,
            "stock": med.stock,
            "expiry": med.expiry.isoformat() if med.expiry else None,
            "sell_price": float(med.sell_price),
            "buy_price": float(med.buy_price),
            "minStock": med.min_stock
        }
    except Exception as e:
        db.rollback()
        print(f"Error updating medicine: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
def delete_medicine(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)  
):
    """Delete medicine - Admin only"""
    med = db.query(models.Medicine).filter(models.Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    db.delete(med)
    db.commit()
    return {"message": "Medicine deleted"}