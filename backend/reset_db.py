# reset_db.py
from database import engine, Base
import models

def reset_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables with new schema...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset successfully!")

if __name__ == "__main__":
    reset_database()