from pydantic import BaseModel

class LoginSchema(BaseModel):
    username: str
    password: str


class MedicineCreate(BaseModel):
    name: str
    category: str
    buy_price: float
    sell_price: float
    stock: int


class SaleCreate(BaseModel):
    medicine_id: int
    quantity: int