
from database import engine, Base
import models

def update_database():
    print("Creating/Updating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database updated successfully!")
    print("Tables:", list(Base.metadata.tables.keys()))

if __name__ == "__main__":
    update_database()