from fastapi import FastAPI
from app.routes import empleados

app = FastAPI(
    title="API Control de Horas",
    description="Backend para gestión y cálculo de horas de empleados",
    version="1.0.0"
)

# Ruta raíz (para comprobar que funciona)
@app.get("/")
def home():
    return {"mensaje": "API de control de horas funcionando 🚀"}

# Incluir router de empleados
app.include_router(empleados.router)