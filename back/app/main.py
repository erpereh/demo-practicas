from fastapi import FastAPI

# Importar routers
from app.routes import empleados
from app.routes import clientes
from app.routes import bancos
from app.routes import proyectos
from app.routes import tarifas


app = FastAPI(
    title="Quality Solutions",
    description="Backend",
    version="1.0.0"
)

# ===============================
# RUTA RAÍZ
# ===============================

@app.get("/")
def home():
    return {
        "mensaje": "API de gestión funcionando correctamente",
        "modulos": [
            "empleados",
            "clientes",
            "bancos",
            "proyectos",
            "tarifas"
        ]
    }


# ===============================
# REGISTRO DE ROUTERS
# ===============================

app.include_router(empleados.router)
app.include_router(clientes.router)
app.include_router(bancos.router)
app.include_router(proyectos.router)
app.include_router(tarifas.router)