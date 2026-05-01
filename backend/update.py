# backend/update_db.py
from database import engine, Base
import models

def update_database():
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database updated successfully!")

if __name__ == "__main__":
    update_database()