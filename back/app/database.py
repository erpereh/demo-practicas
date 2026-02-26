import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Carga las variables del archivo .env
load_dotenv()

# Leer variables
raw_password = os.getenv("DB_PASSWORD")

# --- COMPROBACIÓN DE SEGURIDAD ---
if raw_password is None:
    raise ValueError("❌ ERROR CRÍTICO: No se ha encontrado DB_PASSWORD. Python no está leyendo el archivo .env. Comprueba que está en la raíz de la carpeta 'back'.")
# ---------------------------------

password = urllib.parse.quote_plus(raw_password)
user = os.getenv("DB_USER")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
database = os.getenv("DB_NAME")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# FUNCIÓN GET_DB 
# Crea una sesión de BBDD por cada petición a la API y la cierra al terminar
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()