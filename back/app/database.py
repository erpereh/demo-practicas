import os
import urllib.parse
from typing import Dict, List

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv()

REQUIRED_DB_ENV_VARS = ("DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME")


def _require_db_env() -> Dict[str, str]:
    values: Dict[str, str] = {}
    missing: List[str] = []

    for key in REQUIRED_DB_ENV_VARS:
        value = os.getenv(key)
        if value is None or value.strip() == "":
            missing.append(key)
        else:
            values[key] = value

    if missing:
        raise RuntimeError(
            "Faltan variables de entorno de base de datos: "
            f"{', '.join(missing)}. Revisa el archivo .env de la carpeta back."
        )

    return values


db_env = _require_db_env()

user = urllib.parse.quote_plus(db_env["DB_USER"])
password = urllib.parse.quote_plus(db_env["DB_PASSWORD"])
host = db_env["DB_HOST"]
port = db_env["DB_PORT"]
database = db_env["DB_NAME"]

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def check_db_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
