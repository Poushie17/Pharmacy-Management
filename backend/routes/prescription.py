# backend/routes/prescriptions.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime
from typing import Optional, List

router = APIRouter(prefix="/prescriptions")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_prescriptions(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by patient name")
):
    """Get all prescriptions with optional search"""
    try:
        query = db.query(models.Prescription)
        
        if search:
            query = query.filter(models.Prescription.patient_name.contains(search))
        
        prescriptions = query.order_by(models.Prescription.prescription_date.desc()).all()
        
        return [
            {
                "id": str(pres.id),
                "patient": pres.patient_name,
                "doctor": pres.doctor_name,
                "date": pres.prescription_date.isoformat() if pres.prescription_date else None,
                "medicines": pres.medicines,
                "notes": pres.notes,
                "createdAt": pres.created_at.isoformat() if pres.created_at else None
            }
            for pres in prescriptions
        ]
    except Exception as e:
        print(f"Error fetching prescriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_prescription(prescription_data: dict, db: Session = Depends(get_db)):
    """Create a new prescription"""
    try:
        # Parse medicines from the format
        medicines = prescription_data.get("medicines", [])
        if isinstance(medicines, str):
            # Handle string format "Paracetamol-1, Aspirin-2"
            medicines = []
            for item in prescription_data.get("medicines", "").split(","):
                if "-" in item:
                    name, qty = item.split("-")
                    medicines.append({"name": name.strip(), "qty": int(qty.strip())})
        
        new_prescription = models.Prescription(
            patient_name=prescription_data.get("patient"),
            doctor_name=prescription_data.get("doctor"),
            prescription_date=datetime.strptime(prescription_data.get("date"), "%Y-%m-%d").date(),
            medicines=medicines,
            notes=prescription_data.get("notes", "")
        )
        
        db.add(new_prescription)
        db.commit()
        db.refresh(new_prescription)
        
        return {
            "id": str(new_prescription.id),
            "patient": new_prescription.patient_name,
            "doctor": new_prescription.doctor_name,
            "date": new_prescription.prescription_date.isoformat(),
            "medicines": new_prescription.medicines,
            "message": "Prescription created successfully"
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{prescription_id}")
def update_prescription(prescription_id: str, prescription_data: dict, db: Session = Depends(get_db)):
    """Update a prescription"""
    try:
        pres = db.query(models.Prescription).filter(
            models.Prescription.id == int(prescription_id)
        ).first()
        
        if not pres:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        # Parse medicines
        medicines = prescription_data.get("medicines", [])
        if isinstance(medicines, str):
            medicines = []
            for item in prescription_data.get("medicines", "").split(","):
                if "-" in item:
                    name, qty = item.split("-")
                    medicines.append({"name": name.strip(), "qty": int(qty.strip())})
        
        pres.patient_name = prescription_data.get("patient", pres.patient_name)
        pres.doctor_name = prescription_data.get("doctor", pres.doctor_name)
        if prescription_data.get("date"):
            pres.prescription_date = datetime.strptime(prescription_data.get("date"), "%Y-%m-%d").date()
        pres.medicines = medicines
        pres.notes = prescription_data.get("notes", pres.notes)
        pres.updated_at = datetime.now()
        
        db.commit()
        db.refresh(pres)
        
        return {
            "id": str(pres.id),
            "patient": pres.patient_name,
            "doctor": pres.doctor_name,
            "date": pres.prescription_date.isoformat(),
            "medicines": pres.medicines,
            "message": "Prescription updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{prescription_id}")
def delete_prescription(prescription_id: str, db: Session = Depends(get_db)):
    """Delete a prescription"""
    try:
        pres = db.query(models.Prescription).filter(
            models.Prescription.id == int(prescription_id)
        ).first()
        
        if not pres:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        db.delete(pres)
        db.commit()
        
        return {"message": "Prescription deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))