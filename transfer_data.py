
import sqlite3
import os
from datetime import datetime
from app1 import app, db, User, Order, StoreSettings, OrderItem, Feedback, Product

# SQLite Database Path
SQLITE_DB_PATH = 'happybites.db'

def get_sqlite_conn():
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"Error: {SQLITE_DB_PATH} not found.")
        return None
    return sqlite3.connect(SQLITE_DB_PATH)

def migrate_users(conn):
    print("Migrating Users...")
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password, email, full_name, phone, address FROM user")
    rows = cursor.fetchall()
    
    for row in rows:
        # Check if user exists to avoid duplicates if re-running
        if not User.query.get(row[0]):
            user = User(
                id=row[0],
                username=row[1],
                password=row[2],
                email=row[3],
                full_name=row[4],
                phone=row[5],
                address=row[6]
            )
            db.session.add(user)
    db.session.commit()
    print(f"Migrated {len(rows)} users.")

def migrate_products(conn):
    print("Migrating Products...")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, price, category, image_url, initial_stock, remaining_stock FROM product")
    rows = cursor.fetchall()
    
    for row in rows:
        if not Product.query.get(row[0]):
            product = Product(
                id=row[0],
                name=row[1],
                price=row[2],
                category=row[3],
                image_url=row[4],
                initial_stock=row[5],
                remaining_stock=row[6]
            )
            db.session.add(product)
    db.session.commit()
    print(f"Migrated {len(rows)} products.")

def migrate_feedback(conn):
    print("Migrating Feedback...")
    cursor = conn.cursor()
    cursor.execute("SELECT id, rating, message, timestamp FROM feedback")
    rows = cursor.fetchall()
    
    for row in rows:
        if not Feedback.query.get(row[0]):
            try:
                ts = datetime.strptime(row[3], '%Y-%m-%d %H:%M:%S.%f')
            except ValueError:
                # Fallback for timestamps without microseconds
                try:
                    ts = datetime.strptime(row[3], '%Y-%m-%d %H:%M:%S')
                except:
                    ts = datetime.utcnow()

            feedback = Feedback(
                id=row[0],
                rating=row[1],
                message=row[2],
                timestamp=ts
            )
            db.session.add(feedback)
    db.session.commit()
    print(f"Migrated {len(rows)} feedbacks.")

def migrate_settings(conn):
    print("Migrating Store Settings...")
    cursor = conn.cursor()
    # Handle potential missing columns if schema evolved differently
    # But based on migrate_db.py, we might have 'linkedin'
    # Let's select * and map by index carefully or use row_factory
    
    # Safest is to list known columns from app1.py model
    # id, address, phone, email, instagram, facebook, twitter, whatsapp, linkedin
    
    # Check what columns are actually in sqlite
    cursor.execute("PRAGMA table_info(store_settings)")
    cols = [info[1] for info in cursor.fetchall()]
    
    col_str = ", ".join(cols)
    cursor.execute(f"SELECT {col_str} FROM store_settings")
    rows = cursor.fetchall()
    
    for row in rows:
        row_dict = dict(zip(cols, row))
        if not StoreSettings.query.get(row_dict.get('id', 1)):
            settings = StoreSettings(
                id=row_dict.get('id'),
                address=row_dict.get('address'),
                phone=row_dict.get('phone'),
                email=row_dict.get('email'),
                instagram=row_dict.get('instagram'),
                facebook=row_dict.get('facebook'),
                twitter=row_dict.get('twitter'),
                whatsapp=row_dict.get('whatsapp'),
                linkedin=row_dict.get('linkedin')
            )
            db.session.add(settings)
    db.session.commit()
    print(f"Migrated {len(rows)} settings.")

def migrate_orders(conn):
    print("Migrating Orders...")
    cursor = conn.cursor()
    # Check columns for order table
    cursor.execute("PRAGMA table_info('order')")
    cols = [info[1] for info in cursor.fetchall()]
    col_str = ", ".join([f'"{c}"' for c in cols]) # quote 'order' columns just in case
    
    cursor.execute(f'SELECT {col_str} FROM "order"')
    rows = cursor.fetchall()
    
    for row in rows:
        row_dict = dict(zip(cols, row))
        if not Order.query.get(row_dict.get('id')):
            try:
                ts = datetime.strptime(row_dict.get('timestamp'), '%Y-%m-%d %H:%M:%S.%f')
            except:
                try:
                    ts = datetime.strptime(row_dict.get('timestamp'), '%Y-%m-%d %H:%M:%S')
                except:
                    ts = datetime.utcnow()

            order = Order(
                id=row_dict.get('id'),
                timestamp=ts,
                customer_name=row_dict.get('customer_name'),
                customer_phone=row_dict.get('customer_phone'),
                customer_address=row_dict.get('customer_address'),
                total=row_dict.get('total'),
                status=row_dict.get('status'),
                user_id=row_dict.get('user_id')
            )
            db.session.add(order)
    db.session.commit()
    print(f"Migrated {len(rows)} orders.")

def migrate_order_items(conn):
    print("Migrating Order Items...")
    cursor = conn.cursor()
    cursor.execute("SELECT id, order_id, name, price, quantity FROM order_item")
    rows = cursor.fetchall()
    
    for row in rows:
        if not OrderItem.query.get(row[0]):
            item = OrderItem(
                id=row[0],
                order_id=row[1],
                name=row[2],
                price=row[3],
                quantity=row[4]
            )
            db.session.add(item)
    db.session.commit()
    print(f"Migrated {len(rows)} order items.")

def main():
    print("Starting migration from SQLite to PostgreSQL...")
    
    sqlite_conn = get_sqlite_conn()
    if not sqlite_conn:
        return

    with app.app_context():
        # Ensure tables exist in Postgres
        db.create_all()
        print("PostgreSQL tables created (if not existed).")
        
        try:
            migrate_users(sqlite_conn)
            migrate_products(sqlite_conn)
            migrate_feedback(sqlite_conn)
            migrate_settings(sqlite_conn)
            migrate_orders(sqlite_conn)
            migrate_order_items(sqlite_conn)
            
            # Reset sequences in Postgres (important!)
            # Because we manually inserted IDs, the auto-increment sequences might be out of sync.
            print("Resetting sequences...")
            tables = ['user', 'product', 'feedback', 'store_settings', 'order', 'order_item']
            for table in tables:
                # "order" is a reserved word, need to quote it properly for postgres
                # SQL Alchemy converts 'Order' model to 'order' table.
                # In Postgres, if created via SQLAlchemy, it's usually 'order' (lowercase).
                # To reset sequence: SELECT setval(pg_get_serial_sequence('tablename', 'id'), coalesce(max(id)+1, 1), false) FROM tablename;
                tbl_name = f'"{table}"' if table == 'order' else table
                sql = f"SELECT setval(pg_get_serial_sequence('{tbl_name}', 'id'), coalesce(max(id), 1) + 1, false) FROM {tbl_name};"
                try:
                    db.session.execute(db.text(sql))
                except Exception as e:
                    print(f"Could not reset sequence for {table}: {e}")
            db.session.commit()
            
            print("Migration completed successfully!")
        except Exception as e:
            print(f"An error occurred during migration: {e}")
            db.session.rollback()
        finally:
            sqlite_conn.close()

if __name__ == '__main__':
    main()
