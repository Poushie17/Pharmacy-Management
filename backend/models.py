from sqlalchemy import Column, Integer, String, Float
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(255))
    role = Column(String(20))


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    category = Column(String(100))
    buy_price = Column(Float)
    sell_price = Column(Float)
    stock = Column(Integer)

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True)
    medicine_id = Column(Integer)
    quantity = Column(Integer)
    total = Column(Float)