
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime
from dependencies import get_current_user  

router = APIRouter(prefix="/sales")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_sales(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user) ):
    """Get all sales history - Accessible by all logged-in users"""
    try:
        sales = db.query(models.Sale).order_by(models.Sale.created_at.desc()).all()
        
        result = []
        for sale in sales:
            result.append({
                "id": sale.id,
                "date": sale.created_at.strftime("%Y-%m-%d %H:%M:%S") if sale.created_at else datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "medicine_id": sale.medicine_id,
                "medicine_name": sale.medicine.name if sale.medicine else "Unknown",
                "quantity": sale.quantity,
                "total": sale.total,
                "profit": sale.profit if sale.profit else 0
            })
        
        return result
    except Exception as e:
        print(f"Error fetching sales: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
def create_sale(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  
):
    """Create sale - Accessible by all logged-in users"""
    items = payload.get("items", [])
    
    if not items:
        raise HTTPException(400, "Cart is empty")
    
    total = 0
    total_profit = 0
    
    for item in items:
        medicine = db.query(models.Medicine).filter(
            models.Medicine.id == item["medicine_id"]
        ).first()
        
        if not medicine:
            raise HTTPException(404, f"Medicine {item['medicine_id']} not found")
        
        if medicine.stock < item["qty"]:
            raise HTTPException(400, f"Not enough stock for {medicine.name}")
        
        medicine.stock -= item["qty"]
        
        item_total = medicine.sell_price * item["qty"]
        item_profit = (medicine.sell_price - medicine.buy_price) * item["qty"]
        
        total += item_total
        total_profit += item_profit
        
        sale = models.Sale(
            medicine_id=medicine.id,
            quantity=item["qty"],
            total=item_total,
            profit=item_profit
        )
        db.add(sale)
    
    db.commit()
    
    return {
        "message": "Sale completed successfully",
        "total": total,
        "profit": total_profit,
        "items_sold": len(items),
        "cashier": current_user["username"]  
    }