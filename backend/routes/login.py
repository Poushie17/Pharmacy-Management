from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from auth import create_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(data: schemas.LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.username == data.username
    ).first()

    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"role": user.role})

    return {
        "access_token": token,
        "role": user.role
    }