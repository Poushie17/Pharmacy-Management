# backend/migrate_users_table.py
from database import engine
from sqlalchemy import text, inspect

def migrate_users_table():
    print("=" * 50)
    print("Migrating Users Table (Preserving Data)")
    print("=" * 50)
    
    with engine.connect() as conn:
        # Get existing columns
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        print(f"\n📋 Existing columns: {columns}")
        print(f"📋 Missing columns: {[col for col in ['email', 'full_name', 'avatar', 'created_at', 'updated_at'] if col not in columns]}")
        
        # Add missing columns one by one
        if 'email' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(100)"))
            print("✅ Added email column")
            
            # Set default email for existing admin
            conn.execute(text("UPDATE users SET email = 'admin@pharmacplus.com' WHERE role = 'admin' AND email IS NULL"))
            print("   → Set default email for admin")
        
        if 'full_name' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(100)"))
            print("✅ Added full_name column")
            
            # Set default full_name for existing admin
            conn.execute(text("UPDATE users SET full_name = 'Administrator' WHERE role = 'admin' AND full_name IS NULL"))
            print("   → Set default full_name for admin")
        
        if 'avatar' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar VARCHAR(500)"))
            print("✅ Added avatar column")
        
        if 'created_at' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            print("✅ Added created_at column")
        
        if 'updated_at' not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN updated_at DATETIME"))
            print("✅ Added updated_at column")
        
        # Update any NULL values for existing records
        conn.execute(text("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL"))
        
        conn.commit()
    
    print("\n" + "=" * 50)
    print("Migration completed successfully!")
    print("   All existing data preserved")
    print("=" * 50)
    
    # Verify the changes
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM users WHERE role = 'admin'"))
        admin = result.fetchone()
        if admin:
            print(f"\n👤 Admin user verified:")
            print(f"   Username: {admin[1] if len(admin) > 1 else 'N/A'}")
            print(f"   Email: {admin[4] if len(admin) > 4 else 'N/A'}")
            print(f"   Full Name: {admin[5] if len(admin) > 5 else 'N/A'}")

if __name__ == "__main__":
    migrate_users_table()