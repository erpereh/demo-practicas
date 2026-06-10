from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter()

SECRET = "supersecretkey"

USERNAME = "admin"
PASSWORD = "1234"


class LoginData(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(data: LoginData):

    if (
        data.username != USERNAME
        or data.password != PASSWORD
    ):
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    token = jwt.encode(
        {
            "sub": data.username,
            "exp": datetime.utcnow() + timedelta(days=7)
        },
        SECRET,
        algorithm="HS256"
    )

    return {
        "token": token
    }