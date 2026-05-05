# models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date,Text,Boolean,JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="cashier")
    email = Column(String(100), nullable=True)
    full_name = Column(String(100), nullable=True)
    avatar = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)  # Add this line
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(200), nullable=False)
    doctor_name = Column(String(200), nullable=False)
    prescription_date = Column(Date, nullable=False)
    medicines = Column(JSON, default=list) 
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    category = Column(String(100))
    batch = Column(String(50), default="")
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=20)
    expiry = Column(Date, nullable=True)
    sell_price = Column(Float)
    buy_price = Column(Float)
    created_at = Column(DateTime, default=func.now())

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    quantity = Column(Integer)
    total = Column(Float)
    profit = Column(Float)
    created_at = Column(DateTime, default=func.now())
    medicine = relationship("Medicine")


class RestockOrder(Base):
    __tablename__ = "restock_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier = Column(String(200), nullable=False)
    notes = Column(Text, default="")
    status = Column(String(50), default="pending")  # pending, ordered, received
    total_items = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationship
    items = relationship("RestockItem", back_populates="order")

class RestockItem(Base):
    __tablename__ = "restock_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("restock_orders.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, default=0)
    total_price = Column(Float, default=0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    order = relationship("RestockOrder", back_populates="items")
    medicine = relationship("Medicine")

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    contact_person = Column(String(100), default="")
    phone = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    location = Column(String(200), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    