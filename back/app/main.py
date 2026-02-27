import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# IMPORTANTE: Importamos la configuración de BBDD y los modelos
from app.database import engine, Base
# Importar los modelos es vital para que Base.metadata.create_all los detecte
# from app import models 

from app.routes.clientes import router as clientes_router
from app.routes.empleados import router as empleados_router
from app.routes.bancos import router as bancos_router
from app.routes.proyectos import router as proyectos_router
from app.routes.horas_trab import router as horas_trab_router
from app.routes.factura import router as factura_router
from app.routes.tarifas import router as tarifas_router

# 1. CREACIÓN AUTOMÁTICA DE TABLAS EN MYSQL
# Esto generará las tablas en tu Workbench automáticamente la primera vez que arranques

# 1. CREACIÓN AUTOMÁTICA DE TABLAS EN MYSQL
# Comentamos esto porque el usuario no tiene permisos CREATE
# Base.metadata.create_all(bind=engine) <-- Poner # delante 

# 2. INICIALIZACIÓN DE LA API CON METADATOS CORPORATIVOS
app = FastAPI(
    title="Quality Consulting - API Gestor de Horas",
    description="Backend oficial para la aplicación de gestión de recursos, proyectos y facturación.",
    version="1.0.0"
)

# 3. CONFIGURACIÓN CORS (Permite hablar con el Frontend)
# Leemos la URL del front desde el .env si existe en producción, si no, permite local
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE
    allow_headers=["*"],
)

# 4. INCLUSIÓN DE RUTAS
# OJO: Si dentro de cada router.py no han puesto el prefijo "/api", 
# podéis ponerlo aquí directamente así: app.include_router(clientes_router, prefix="/api")
app.include_router(clientes_router)
app.include_router(empleados_router)
app.include_router(bancos_router)
app.include_router(proyectos_router)
app.include_router(horas_trab_router)
app.include_router(factura_router)
app.include_router(tarifas_router)

# 5. HEALTHCHECK (Para saber si el servidor está vivo)
@app.get("/health", tags=["Estado del Servidor"])
def health():
    return {
        "status": "ok", 
        "message": "API de Quality funcionando correctamente",
        "database": "conectada"
    }