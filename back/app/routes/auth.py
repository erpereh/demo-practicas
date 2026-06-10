import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from jose import jwt
from pydantic import BaseModel


load_dotenv()

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("Falta SECRET_KEY en el archivo .env de la carpeta back.")

USERNAME = "admin"
PASSWORD = "1234"


class LoginData(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(data: LoginData):
    if data.username != USERNAME or data.password != PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = jwt.encode(
        {
            "sub": data.username,
            "exp": datetime.utcnow() + timedelta(days=7),
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    return {"token": token}
