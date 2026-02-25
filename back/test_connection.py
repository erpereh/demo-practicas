from app.database import engine

try:
    with engine.connect() as connection:
        print("Conexión correcta a MySQL 🎉")
except Exception as e:
    print("Error:", e)