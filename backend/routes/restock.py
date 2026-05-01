# backend/routes/restock.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime
from typing import List

router = APIRouter(prefix="/restock")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_restock_data(db: Session = Depends(get_db)):
    """Get low stock items and restock orders"""
    try:
        # Get low stock items (stock < min_stock)
        low_stock = db.query(models.Medicine).filter(
            models.Medicine.stock < models.Medicine.min_stock
        ).all()
        
        low_stock_data = [
            {
                "id": med.id,
                "name": med.name,
                "stock": med.stock,
                "minStock": med.min_stock,
                "category": med.category
            }
            for med in low_stock
        ]
        
        # Get restock orders
        orders = db.query(models.RestockOrder).order_by(
            models.RestockOrder.created_at.desc()
        ).all()
        
        orders_data = []
        for order in orders:
            orders_data.append({
                "id": order.id,
                "supplier": order.supplier,
                "notes": order.notes,
                "date": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "items": order.total_items,
                "status": order.status
            })
        
        return {
            "lowStock": low_stock_data,
            "orders": orders_data,
            "totalLowStock": len(low_stock_data)
        }
    except Exception as e:
        print(f"Error fetching restock data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/orders")
def create_restock_order(order_data: dict, db: Session = Depends(get_db)):
    """Create a new restock order"""
    try:
        # Get low stock items
        low_stock = db.query(models.Medicine).filter(
            models.Medicine.stock < models.Medicine.min_stock
        ).all()
        
        # Create order
        new_order = models.RestockOrder(
            supplier=order_data.get("supplier"),
            notes=order_data.get("notes", ""),
            total_items=len(low_stock),
            status="pending"
        )
        db.add(new_order)
        db.flush()
        
        # Add items to order
        for medicine in low_stock:
            restock_qty = medicine.min_stock * 2 - medicine.stock  # Restock to double min stock
            if restock_qty < medicine.min_stock:
                restock_qty = medicine.min_stock
            
            order_item = models.RestockItem(
                order_id=new_order.id,
                medicine_id=medicine.id,
                quantity=restock_qty,
                unit_price=medicine.buy_price,
                total_price=medicine.buy_price * restock_qty
            )
            db.add(order_item)
        
        db.commit()
        db.refresh(new_order)
        
        return {
            "message": "Restock order created successfully",
            "order_id": new_order.id,
            "total_items": new_order.total_items
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating restock order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/orders/{order_id}/receive")
def receive_restock(order_id: int, db: Session = Depends(get_db)):
    """Mark order as received and update stock"""
    try:
        order = db.query(models.RestockOrder).filter(
            models.RestockOrder.id == order_id
        ).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update stock for each item
        for item in order.items:
            medicine = item.medicine
            if medicine:
                medicine.stock += item.quantity
        
        order.status = "received"
        order.updated_at = datetime.now()
        
        db.commit()
        
        return {"message": "Order received and stock updated"}
    except Exception as e:
        db.rollback()
        print(f"Error receiving order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/orders/{order_id}")
def delete_restock_order(order_id: int, db: Session = Depends(get_db)):
    """Delete a restock order"""
    try:
        order = db.query(models.RestockOrder).filter(
            models.RestockOrder.id == order_id
        ).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        db.delete(order)
        db.commit()
        
        return {"message": "Order deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting order: {e}")
        raise HTTPException(status_code=500, detail=str(e))