from fastapi import FastAPI

from database import Base, engine
import models  # 👈 IMPORTANT: forces table registration

from routes import login, medicines, sales

app = FastAPI()

# create tables AFTER models are loaded
Base.metadata.create_all(bind=engine)

app.include_router(login.router)
app.include_router(medicines.router)
app.include_router(sales.router)