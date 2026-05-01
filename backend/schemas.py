from pydantic import BaseModel
from typing import Optional

class MedicineBase(BaseModel):
    name: str
    category: str
    sell_price: float
    buy_price: float
    stock: int

class MedicineCreate(MedicineBase):
    pass

class Medicine(MedicineBase):
    id: int
    
    class Config:
        orm_mode = True

class SaleBase(BaseModel):
    medicine_id: int
    quantity: int
    total: float

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    profit: Optional[float] = None
    
    class Config:
        orm_mode = True