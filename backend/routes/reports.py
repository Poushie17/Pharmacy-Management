# backend/routes/reports.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import SessionLocal
import models
from datetime import datetime, timedelta
from typing import Optional
from collections import defaultdict

router = APIRouter(prefix="/reports")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    period: str = Query("daily", description="daily, weekly, monthly"),
    date: str = Query(None, description="Reference date (YYYY-MM-DD)")
):
    """Get complete dashboard data"""
    try:
        # Set reference date
        if date:
            ref_date = datetime.strptime(date, "%Y-%m-%d")
        else:
            ref_date = datetime.now()
        
        # Calculate date range based on period
        if period == "daily":
            start_date = ref_date.replace(hour=0, minute=0, second=0)
            end_date = ref_date.replace(hour=23, minute=59, second=59)
            date_format = "%Y-%m-%d"
            group_by = func.date(models.Sale.created_at)
        elif period == "weekly":
            start_date = ref_date - timedelta(days=ref_date.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0)
            end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)
            date_format = "%Y-%m-%d"
            group_by = func.date(models.Sale.created_at)
        elif period == "monthly":
            start_date = ref_date.replace(day=1, hour=0, minute=0, second=0)
            end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
            date_format = "%Y-%m"
            group_by = func.strftime("%Y-%m", models.Sale.created_at)
        else:
            start_date = ref_date.replace(hour=0, minute=0, second=0)
            end_date = ref_date.replace(hour=23, minute=59, second=59)
            date_format = "%Y-%m-%d"
            group_by = func.date(models.Sale.created_at)
        
        # Get sales in date range
        sales = db.query(models.Sale).filter(
            models.Sale.created_at >= start_date,
            models.Sale.created_at <= end_date
        ).all()
        
        # Calculate summary
        total_revenue = sum(sale.total for sale in sales)
        total_profit = sum(sale.profit or 0 for sale in sales)
        total_transactions = len(sales)
        avg_transaction = total_revenue / total_transactions if total_transactions > 0 else 0
        
        # Get top selling medicines
        medicine_sales = defaultdict(lambda: {"name": "", "units": 0, "total": 0})
        for sale in sales:
            medicine_name = sale.medicine.name if sale.medicine else "Unknown"
            medicine_sales[sale.medicine_id]["name"] = medicine_name
            medicine_sales[sale.medicine_id]["units"] += sale.quantity
            medicine_sales[sale.medicine_id]["total"] += sale.total
        
        top_selling = sorted(
            [{"name": data["name"], "units": data["units"], "total": round(data["total"], 2)} 
             for data in medicine_sales.values()],
            key=lambda x: x["total"],
            reverse=True
        )[:5]
        
        # Get sales trend
        trend_data = db.query(
            group_by.label("date"),
            func.sum(models.Sale.total).label("sales")
        ).filter(
            models.Sale.created_at >= start_date,
            models.Sale.created_at <= end_date
        ).group_by(group_by).order_by(group_by).all()
        
        sales_trend = [
            {"day": str(row.date), "sales": round(row.sales or 0, 2)}
            for row in trend_data
        ]
        
        # Get product sales for pie chart
        product_sales = []
        for med_id, data in medicine_sales.items():
            product_sales.append({
                "name": data["name"],
                "value": round(data["total"], 2)
            })
        product_sales = sorted(product_sales, key=lambda x: x["value"], reverse=True)[:5]
        
        # Get low stock alerts
        low_stock_items = db.query(models.Medicine).filter(
            models.Medicine.stock < models.Medicine.min_stock
        ).count()
        
        # Get expiring soon items (within 30 days)
        expiring_soon = db.query(models.Medicine).filter(
            models.Medicine.expiry <= datetime.now().date() + timedelta(days=30),
            models.Medicine.expiry >= datetime.now().date()
        ).count()
        
        return {
            "summary": {
                "revenue": round(total_revenue, 2),
                "transactions": total_transactions,
                "avg": round(avg_transaction, 2),
                "profit": round(total_profit, 2)
            },
            "topSelling": top_selling,
            "alerts": {
                "lowStock": low_stock_items,
                "expiringSoon": expiring_soon
            },
            "salesTrend": sales_trend,
            "productSales": product_sales,
            "period": period,
            "dateRange": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            }
        }
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/sales")
def export_sales_report(
    db: Session = Depends(get_db),
    format: str = "json",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Export sales data"""
    try:
        query = db.query(models.Sale).order_by(models.Sale.created_at.desc())
        
        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(models.Sale.created_at >= start)
        
        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(models.Sale.created_at <= end.replace(hour=23, minute=59, second=59))
        
        sales = query.all()
        
        export_data = []
        for sale in sales:
            export_data.append({
                "id": sale.id,
                "date": sale.created_at.isoformat() if sale.created_at else None,
                "medicine": sale.medicine.name if sale.medicine else "Unknown",
                "quantity": sale.quantity,
                "total": sale.total,
                "profit": sale.profit or 0
            })
        
        return {
            "data": export_data,
            "count": len(export_data),
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error exporting sales: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/stock")
def export_stock_report(db: Session = Depends(get_db)):
    """Export current stock data"""
    try:
        medicines = db.query(models.Medicine).order_by(models.Medicine.name).all()
        
        stock_data = []
        for med in medicines:
            stock_data.append({
                "id": med.id,
                "name": med.name,
                "category": med.category,
                "batch": med.batch,
                "stock": med.stock,
                "minStock": med.min_stock,
                "status": "Low Stock" if med.stock < med.min_stock else "Adequate",
                "expiry": med.expiry.isoformat() if med.expiry else None,
                "buyPrice": med.buy_price,
                "sellPrice": med.sell_price
            })
        
        return {
            "data": stock_data,
            "count": len(stock_data),
            "lowStockCount": len([m for m in stock_data if m["stock"] < m["minStock"]]),
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error exporting stock: {e}")
        raise HTTPException(status_code=500, detail=str(e))