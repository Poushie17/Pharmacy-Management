# backend/routes/suppliers.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/suppliers")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_suppliers(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by name")
):
    """Get all suppliers with optional search"""
    try:
        query = db.query(models.Supplier)
        
        if search:
            query = query.filter(models.Supplier.name.contains(search))
        
        suppliers = query.order_by(models.Supplier.name).all()
        
        return [
            {
                "id": str(supplier.id),
                "name": supplier.name,
                "contact": supplier.contact_person,
                "phone": supplier.phone,
                "email": supplier.email,
                "location": supplier.location,
                "isActive": supplier.is_active,
                "createdAt": supplier.created_at.isoformat() if supplier.created_at else None
            }
            for supplier in suppliers
        ]
    except Exception as e:
        print(f"Error fetching suppliers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_supplier(supplier_data: dict, db: Session = Depends(get_db)):
    """Create a new supplier"""
    try:
        # Check if supplier with same name exists
        existing = db.query(models.Supplier).filter(
            models.Supplier.name == supplier_data.get("name")
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Supplier with this name already exists")
        
        new_supplier = models.Supplier(
            name=supplier_data.get("name"),
            contact_person=supplier_data.get("contact", ""),
            phone=supplier_data.get("phone"),
            email=supplier_data.get("email"),
            location=supplier_data.get("location", ""),
            is_active=True
        )
        
        db.add(new_supplier)
        db.commit()
        db.refresh(new_supplier)
        
        return {
            "id": str(new_supplier.id),
            "name": new_supplier.name,
            "contact": new_supplier.contact_person,
            "phone": new_supplier.phone,
            "email": new_supplier.email,
            "location": new_supplier.location,
            "message": "Supplier created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating supplier: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{supplier_id}")
def update_supplier(supplier_id: str, supplier_data: dict, db: Session = Depends(get_db)):
    """Update a supplier"""
    try:
        supplier = db.query(models.Supplier).filter(
            models.Supplier.id == int(supplier_id)
        ).first()
        
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        # Update fields
        supplier.name = supplier_data.get("name", supplier.name)
        supplier.contact_person = supplier_data.get("contact", supplier.contact_person)
        supplier.phone = supplier_data.get("phone", supplier.phone)
        supplier.email = supplier_data.get("email", supplier.email)
        supplier.location = supplier_data.get("location", supplier.location)
        supplier.updated_at = datetime.now()
        
        db.commit()
        db.refresh(supplier)
        
        return {
            "id": str(supplier.id),
            "name": supplier.name,
            "contact": supplier.contact_person,
            "phone": supplier.phone,
            "email": supplier.email,
            "location": supplier.location,
            "message": "Supplier updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating supplier: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: str, db: Session = Depends(get_db)):
    """Delete a supplier"""
    try:
        supplier = db.query(models.Supplier).filter(
            models.Supplier.id == int(supplier_id)
        ).first()
        
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        # Soft delete - just deactivate
        supplier.is_active = False
        
        db.commit()
        
        return {"message": "Supplier deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting supplier: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{supplier_id}")
def get_supplier(supplier_id: str, db: Session = Depends(get_db)):
    """Get a single supplier by ID"""
    try:
        supplier = db.query(models.Supplier).filter(
            models.Supplier.id == int(supplier_id)
        ).first()
        
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        return {
            "id": str(supplier.id),
            "name": supplier.name,
            "contact": supplier.contact_person,
            "phone": supplier.phone,
            "email": supplier.email,
            "location": supplier.location,
            "isActive": supplier.is_active,
            "createdAt": supplier.created_at.isoformat() if supplier.created_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching supplier: {e}")
        raise HTTPException(status_code=500, detail=str(e))