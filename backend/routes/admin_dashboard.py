
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
import models
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db)):
    """Get all dashboard metrics and alerts"""
    try:
        # Count medicines
        total_medicines = db.query(models.Medicine).count()
        
        # Count sales
        total_sales = db.query(models.Sale).count()
        
        # Count suppliers
        total_suppliers = db.query(models.Supplier).count()
        
        # Calculate total revenue
        total_revenue = db.query(func.sum(models.Sale.total)).scalar() or 0
        
        # Calculate total profit
        total_profit = db.query(func.sum(models.Sale.profit)).scalar() or 0
        
        # Low stock items (stock < min_stock)
        low_stock_count = db.query(models.Medicine).filter(
            models.Medicine.stock < models.Medicine.min_stock
        ).count()
        
       
        expiring_soon_count = db.query(models.Medicine).filter(
            models.Medicine.expiry <= datetime.now().date() + timedelta(days=30),
            models.Medicine.expiry >= datetime.now().date()
        ).count()
        
       
        recent_sales = db.query(models.Sale).order_by(
            models.Sale.created_at.desc()
        ).limit(10).all()
        
        recent_sales_data = []
        for sale in recent_sales:
            recent_sales_data.append({
                "id": sale.id,
                "date": sale.created_at.strftime("%Y-%m-%d %H:%M") if sale.created_at else "N/A",
                "total": sale.total,
                "medicine_name": sale.medicine.name if sale.medicine else "Unknown"
            })
        
        # Get expiring medicines list
        expiring_medicines = db.query(models.Medicine).filter(
            models.Medicine.expiry <= datetime.now().date() + timedelta(days=30),
            models.Medicine.expiry >= datetime.now().date()
        ).order_by(models.Medicine.expiry).all()
        
        expiring_medicines_data = []
        for med in expiring_medicines:
            days_left = (med.expiry - datetime.now().date()).days if med.expiry else 0
            expiring_medicines_data.append({
                "id": med.id,
                "name": med.name,
                "expiry": med.expiry.isoformat() if med.expiry else "N/A",
                "days_left": days_left,
                "stock": med.stock
            })
        
        # Get low stock medicines list
        low_stock_medicines = db.query(models.Medicine).filter(
            models.Medicine.stock < models.Medicine.min_stock
        ).all()
        
        low_stock_medicines_data = []
        for med in low_stock_medicines:
            low_stock_medicines_data.append({
                "id": med.id,
                "name": med.name,
                "stock": med.stock,
                "min_stock": med.min_stock
            })
        
        return {
            "metrics": {
                "medicines": total_medicines,
                "sales": total_sales,
                "suppliers": total_suppliers,
                "revenue": round(total_revenue, 2),
                "profit": round(total_profit, 2),
                "lowStock": low_stock_count,
                "expiryAlert": expiring_soon_count
            },
            "recentSales": recent_sales_data,
            "expiringMedicines": expiring_medicines_data,
            "lowStockMedicines": low_stock_medicines_data
        }
    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))