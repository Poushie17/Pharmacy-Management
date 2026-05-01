from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas

router = APIRouter(prefix="/sales")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_sale(data: schemas.SaleCreate, db: Session = Depends(get_db)):
    medicine = db.query(models.Medicine).filter(
        models.Medicine.id == data.medicine_id
    ).first()

    if not medicine:
        raise HTTPException(404, "Medicine not found")

    if medicine.stock < data.quantity:
        raise HTTPException(400, "Not enough stock")

    total = medicine.price * data.quantity

    medicine.stock -= data.quantity

    sale = models.Sale(
        medicine_id=data.medicine_id,
        quantity=data.quantity,
        total=total
    )

    db.add(sale)
    db.commit()

    return {"message": "Sale completed", "total": total}