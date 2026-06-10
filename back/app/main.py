import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.database import Base, check_db_connection, engine
from app.errors import DB_CONNECTION_ERROR_MESSAGE
from app.routes.auth import router as auth_router
from app.routes.bancos import router as bancos_router
from app.routes.clientes import router as clientes_router
from app.routes.empleados import router as empleados_router
from app.routes.factura import router as factura_router
from app.routes.horas_trab import router as horas_trab_router
from app.routes.import_horas import router as import_horas_router
from app.routes.proyectos import router as proyectos_router
from app.routes.tarifas import router as tarifas_router


if os.getenv("INIT_DB", "false").strip().lower() == "true":
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Quality Consulting - API Gestor de Horas",
    description="Backend oficial para la aplicacion de gestion de recursos, proyectos y facturacion.",
    version="1.0.0",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ALLOWED_ORIGINS: list[str] = []
for origin in (FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"):
    if origin and origin not in ALLOWED_ORIGINS:
        ALLOWED_ORIGINS.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=503,
        content={"detail": DB_CONNECTION_ERROR_MESSAGE},
    )


app.include_router(clientes_router)
app.include_router(empleados_router)
app.include_router(auth_router)
app.include_router(bancos_router)
app.include_router(proyectos_router)
app.include_router(horas_trab_router)
app.include_router(import_horas_router)
app.include_router(factura_router)
app.include_router(tarifas_router)


@app.get("/health", tags=["Estado del Servidor"])
def health():
    try:
        check_db_connection()
    except SQLAlchemyError:
        return {
            "status": "error",
            "database": "disconnected",
            "detail": DB_CONNECTION_ERROR_MESSAGE,
        }

    return {"status": "ok", "database": "connected"}
