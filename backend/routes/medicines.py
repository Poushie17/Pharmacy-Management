from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas

router = APIRouter(prefix="/medicines")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_medicines(db: Session = Depends(get_db)):
    return db.query(models.Medicine).all()


@router.post("/")
def create_medicine(data: schemas.MedicineCreate, db: Session = Depends(get_db)):
    med = models.Medicine(**data.dict())
    db.add(med)
    db.commit()
    db.refresh(med)
    return med