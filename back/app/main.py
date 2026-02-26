# back/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.clientes import router as clientes_router
from app.routes.empleados import router as empleados_router
from app.routes.bancos import router as bancos_router
from app.routes.proyectos import router as proyectos_router
from app.routes.horas_trab import router as horas_trab_router
from app.routes.factura import router as factura_router
from app.routes.tarifas import router as tarifas_router

app = FastAPI(title="DEMO-PRACTICAS API", version="1.0.0")

# CORS para que Next.js (localhost:3000) pueda llamar al backend (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RUTAS
app.include_router(clientes_router)
app.include_router(empleados_router)
app.include_router(bancos_router)
app.include_router(proyectos_router)
app.include_router(horas_trab_router)
app.include_router(factura_router)
app.include_router(tarifas_router)

# Healthcheck rápido
@app.get("/health")
def health():
    return {"status": "ok"}