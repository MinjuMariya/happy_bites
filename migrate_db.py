
import sqlite3
import os

db_path = os.path.join(os.getcwd(), 'happybites.db')

def migrate():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column exists first to avoid error
        cursor.execute("PRAGMA table_info('order')")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'customer_address' not in columns:
            print("Adding customer_address column to order table...")
            cursor.execute('ALTER TABLE "order" ADD COLUMN customer_address TEXT')
            conn.commit()
            print("Migration successful: customer_address column added.")
        else:
            print("Column customer_address already exists.")
            
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
