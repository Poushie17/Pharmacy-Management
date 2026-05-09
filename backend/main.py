from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models 

from routes import medicines, sales, restock, suppliers, reports, prescription, admin_dashboard, settings, auth

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(medicines.router)
app.include_router(sales.router)
app.include_router(restock.router) 
app.include_router(suppliers.router)
app.include_router(reports.router)
app.include_router(prescription.router)
app.include_router(admin_dashboard.router)
app.include_router(settings.router)

# Update CORS to include your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://pharmacy-management-navy.vercel.app",  
        "https://pharmacy-management-1-ul81.onrender.com", 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "FastAPI server is running"}