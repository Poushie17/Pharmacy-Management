# backend/setup_users.py
from database import engine
from sqlalchemy import text, inspect
from database import SessionLocal
import models

def setup_users():
    print("=" * 60)
    print("SETTING UP USERS TABLE AND CREATING USERS")
    print("=" * 60)
    
    with engine.connect() as conn:
        # Get existing columns
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        print(f"\n📋 Existing columns: {columns}")
        
        # Add missing columns
        print("\n🔧 Adding missing columns...")
        
        if 'email' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(100)"))
            print("  ✅ Added email column")
        
        if 'full_name' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(100)"))
            print("  ✅ Added full_name column")
        
        if 'avatar' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar VARCHAR(500)"))
            print("  ✅ Added avatar column")
        
        if 'created_at' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            print("  ✅ Added created_at column")
        
        if 'updated_at' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN updated_at DATETIME"))
            print("  ✅ Added updated_at column")
        
        if 'is_active' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"))
            print("  ✅ Added is_active column")
        
        # Update NULL values
        conn.execute(text("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL"))
        conn.execute(text("UPDATE users SET is_active = 1 WHERE is_active IS NULL"))
        conn.execute(text("UPDATE users SET email = 'admin@pharmacplus.com' WHERE role = 'admin' AND email IS NULL"))
        conn.execute(text("UPDATE users SET full_name = 'Administrator' WHERE role = 'admin' AND full_name IS NULL"))
        
        conn.commit()
    
    print("\n✅ Database migration completed!")
    
    # Create users
    print("\n👤 Creating users...")
    db = SessionLocal()
    
    # Check if users exist
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    cashier = db.query(models.User).filter(models.User.username == "cashier").first()
    
    if not admin:
        admin_user = models.User(
            username="admin",
            password="admin123",
            role="admin",
            email="admin@pharmacplus.com",
            full_name="Administrator",
            is_active=True
        )
        db.add(admin_user)
        print("  ✅ Admin user created (admin / admin123)")
    else:
        print("  ⚠️ Admin user already exists")
    
    if not cashier:
        cashier_user = models.User(
            username="cashier",
            password="cashier123",
            role="cashier",
            email="cashier@pharmacplus.com",
            full_name="Cashier User",
            is_active=True
        )
        db.add(cashier_user)
        print("  ✅ Cashier user created (cashier / cashier123)")
    else:
        print("  ⚠️ Cashier user already exists")
    
    db.commit()
    db.close()
    
    # Verification
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT username, role, email, full_name, is_active FROM users"))
        users = result.fetchall()
        print("\n📋 Users in database:")
        for user in users:
            print(f"   - {user[0]} | Role: {user[1]} | Email: {user[2]} | Name: {user[3]} | Active: {user[4]}")
    
    print("\n" + "=" * 60)
    print("✅ SETUP COMPLETE!")
    print("=" * 60)
    print("\n🔑 Login Credentials:")
    print("   Admin:   username = 'admin'   | password = 'admin123'")
    print("   Cashier: username = 'cashier' | password = 'cashier123'")
    print("=" * 60)

if __name__ == "__main__":
    setup_users()