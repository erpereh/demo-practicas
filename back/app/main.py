
from fastapi import FastAPI

from app.routes import empleados
from app.routes import clientes
from app.routes import bancos

app = FastAPI(
    title="API Control de Horas",
    description="Backend para gestión y cálculo de horas de empleados",
    version="1.0.0"
)

# Ruta raíz
@app.get("/")
def home():
    return {"mensaje": "API de gestión funcionando correctamente"}

# Registrar routers
app.include_router(empleados.router)
app.include_router(clientes.router)
app.include_router(bancos.router)