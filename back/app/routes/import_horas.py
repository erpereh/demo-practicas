from __future__ import annotations

from uuid import uuid4
from typing import Dict, List, Optional

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db


router = APIRouter(tags=["Importacion de horas"])

_PREVIEW_CACHE: Dict[str, List[Dict]] = {}


@router.post("/preview-horas")
async def preview_horas(archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        df = pd.read_excel(archivo.file)
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo leer el archivo Excel.")

    df.columns = df.columns.str.strip().str.replace("\n", "", regex=False)
    df = df.map(lambda value: value.strip() if isinstance(value, str) else value)

    filas_validas: List[Dict] = []
    errores: List[Dict] = []
    total_horas = 0.0

    for index, fila in df.iterrows():
        try:
            id_sociedad = "01"
            id_empleado = str(fila.get("ID del empleado", "")).strip()
            id_proyecto = str(fila.get("Codigo de proyecto", fila.get("Código de proyecto", ""))).strip()
            horas_dia = fila.get("Tiempo trabajado")
            desc_tarea = fila.get("Nombre del proyecto")
            desc_tarea = "" if pd.isna(desc_tarea) else str(desc_tarea)

            fecha_raw = fila.get("Dia", fila.get("Día"))
            fecha = None if pd.isna(fecha_raw) else pd.to_datetime(fecha_raw, dayfirst=True).date()

            if not id_empleado:
                errores.append({"fila": int(index) + 2, "mensaje": "Empleado vacio"})
                continue
            if not id_proyecto:
                errores.append({"fila": int(index) + 2, "mensaje": "Proyecto vacio"})
                continue
            if pd.isna(horas_dia):
                errores.append({"fila": int(index) + 2, "mensaje": "Horas vacias"})
                continue
            if fecha is None:
                errores.append({"fila": int(index) + 2, "mensaje": "Fecha invalida"})
                continue

            empleado = db.execute(
                text("SELECT 1 FROM EMPLEADOS WHERE ID_EMPLEADO = :id"),
                {"id": id_empleado},
            ).fetchone()
            if not empleado:
                errores.append({"fila": int(index) + 2, "mensaje": "Empleado no existe"})
                continue

            proyecto = db.execute(
                text("SELECT ID_CLIENTE FROM PROYECTOS WHERE ID_PROYECTO = :id"),
                {"id": id_proyecto},
            ).fetchone()
            if not proyecto:
                errores.append({"fila": int(index) + 2, "mensaje": "Proyecto no existe"})
                continue

            horas = float(horas_dia)
            total_horas += horas

            filas_validas.append(
                {
                    "ID_SOCIEDAD": id_sociedad,
                    "ID_EMPLEADO": id_empleado,
                    "FECHA": fecha.isoformat(),
                    "ID_CLIENTE": proyecto.ID_CLIENTE,
                    "ID_PROYECTO": id_proyecto,
                    "HORAS_DIA": horas,
                    "DESC_TAREA": desc_tarea,
                    "ESTADO": "PENDIENTE",
                    "ORIGEN": "EXCEL",
                }
            )
        except SQLAlchemyError:
            raise
        except Exception as exc:
            errores.append({"fila": int(index) + 2, "mensaje": str(exc)})

    import_token = str(uuid4())
    _PREVIEW_CACHE[import_token] = filas_validas

    return {
        "import_token": import_token,
        "total_filas": len(df),
        "filas_validas": len(filas_validas),
        "total_horas": total_horas,
        "errores": errores,
    }


@router.post("/confirm-horas")
def confirm_horas(data: Optional[Dict] = None, db: Session = Depends(get_db)):
    import_token = (data or {}).get("import_token")
    filas_validas = _PREVIEW_CACHE.get(import_token or "")

    if not filas_validas:
        raise HTTPException(status_code=400, detail="No hay datos para confirmar")

    for fila in filas_validas:
        fila["FECHA"] = pd.to_datetime(fila["FECHA"]).date()
        existe = db.execute(
            text(
                """
                SELECT 1
                FROM HORAS_TRAB
                WHERE ID_EMPLEADO = :ID_EMPLEADO
                  AND FECHA = :FECHA
                  AND ID_PROYECTO = :ID_PROYECTO
                """
            ),
            fila,
        ).fetchone()

        if not existe:
            db.execute(
                text(
                    """
                    INSERT INTO HORAS_TRAB
                    (ID_SOCIEDAD, ID_EMPLEADO, FECHA, ID_CLIENTE, ID_PROYECTO,
                     HORAS_DIA, DESC_TAREA, ESTADO, ORIGEN)
                    VALUES
                    (:ID_SOCIEDAD, :ID_EMPLEADO, :FECHA, :ID_CLIENTE, :ID_PROYECTO,
                     :HORAS_DIA, :DESC_TAREA, :ESTADO, :ORIGEN)
                    """
                ),
                fila,
            )

    db.commit()
    _PREVIEW_CACHE.pop(import_token, None)

    return {"mensaje": "Horas registradas correctamente"}
