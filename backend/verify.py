# backend/verify_cashier.py
from database import SessionLocal
import models

db = SessionLocal()

# Check cashier
cashier = db.query(models.User).filter(models.User.username == "cashier").first()

if cashier:
    print(f"✅ Cashier found:")
    print(f"   Username: {cashier.username}")
    print(f"   Password: {cashier.password}")
    print(f"   Role: {cashier.role}")
    print(f"   is_active: {cashier.is_active}")
    print(f"   full_name: {cashier.full_name}")
else:
    print("❌ Cashier NOT found!")

# Check all users
print("\n📋 All users:")
all_users = db.query(models.User).all()
for user in all_users:
    print(f"   - {user.username}: {user.password} (role: {user.role})")

db.close()