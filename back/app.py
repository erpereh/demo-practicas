from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pandas as pd
from sqlalchemy import create_engine, text
import os
import urllib.parse
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

app = Flask(__name__)
app.secret_key = "super_secret_key"

CORS(app, supports_credentials=True)

load_dotenv()

# =========================
# CONFIGURACIÓN BASE DATOS
# =========================

password = urllib.parse.quote_plus(os.getenv("DB_PASSWORD"))
user = os.getenv("DB_USER")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
database = os.getenv("DB_NAME")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# =========================
# PREVISUALIZACIÓN (NO GUARDA)
# =========================

@app.route('/preview-horas', methods=['POST'])
def preview_horas():

    print("ENTRÓ A preview_horas")

    if 'archivo' not in request.files:
        print("NO VIENE ARCHIVO") 
        return jsonify({'error': 'No se recibió archivo'}), 400

    archivo = request.files['archivo']

    try:
        print("Intentando leer Excel...")
        df = pd.read_excel(archivo)
        print("Excel leído correctamente") 
        df.columns = df.columns.str.strip()       
        df.columns = df.columns.str.replace('\n', '')
        df = df.map(lambda x: x.strip() if isinstance(x, str) else x)

        filas_validas = []
        errores = []
        total_horas = 0

        with engine.connect() as conn:

            for index, fila in df.iterrows():

                try:

                    # ======================
                    # MAPPING DEL EXCEL
                    # ======================

                    ID_SOCIEDAD = "01"

                    ID_EMPLEADO = str(fila.get('ID del empleado')).strip()
                    print("Empleado:", ID_EMPLEADO)   # 👈 AQUÍ

                    fecha_raw = fila.get('Día')

                    if pd.isna(fecha_raw):
                        FECHA = None
                    else:
                        FECHA = pd.to_datetime(fecha_raw, dayfirst=True).date()

                    ID_PROYECTO = str(fila.get('Código de proyecto')).strip()
                    print("Proyecto:", ID_PROYECTO)   # 👈 AQUÍ

                    HORAS_DIA = fila.get('Tiempo trabajado')

                    DESC_TAREA = fila.get('Nombre del proyecto')

                    if pd.isna(DESC_TAREA):
                        DESC_TAREA = ""

                    # ======================
                    # VALIDACIONES
                    # ======================

                    if not ID_EMPLEADO:
                        errores.append({
                            "fila": int(index)+2,
                            "mensaje": "Empleado vacío"
                        })
                        continue

                    if pd.isna(HORAS_DIA):
                        errores.append({
                            "fila": int(index)+2,
                            "mensaje": "Horas vacías"
                        })
                        continue

                    if FECHA is None:
                        errores.append({
                            "fila": int(index)+2,
                            "mensaje": "Fecha inválida"
                        })
                        continue

                    # ======================
                    # VERIFICAR EMPLEADO
                    # ======================

                    empleado = conn.execute(
                        text("""
                        SELECT 1 
                        FROM EMPLEADOS 
                        WHERE ID_EMPLEADO = :id
                        """),
                        {"id": ID_EMPLEADO}
                    ).fetchone()

                    if not empleado:
                        print("❌ NO EXISTE EMPLEADO:", ID_EMPLEADO)  # 👈 AQUÍ
                        errores.append({
                            "fila": int(index)+2,
                            "mensaje": "Empleado no existe"
                        })
                        continue

                    # ======================
                    # OBTENER CLIENTE DEL PROYECTO
                    # ======================

                    proyecto = conn.execute(
                        text("""
                        SELECT ID_CLIENTE 
                        FROM PROYECTOS
                        WHERE ID_PROYECTO = :id
                        """),
                        {"id": ID_PROYECTO}
                    ).fetchone()

                    if not proyecto:
                        print("❌ NO EXISTE PROYECTO:", ID_PROYECTO)  # 👈 AQUÍ
                        errores.append({
                            "fila": int(index)+2,
                            "mensaje": "Proyecto no existe"
                        })
                        continue

                    ID_CLIENTE = proyecto.ID_CLIENTE

                    HORAS_DIA = float(HORAS_DIA)

                    total_horas += HORAS_DIA

                    filas_validas.append({
                        "ID_SOCIEDAD": ID_SOCIEDAD,
                        "ID_EMPLEADO": ID_EMPLEADO,
                        "FECHA": FECHA,
                        "ID_CLIENTE": ID_CLIENTE,
                        "ID_PROYECTO": ID_PROYECTO,
                        "HORAS_DIA": HORAS_DIA,
                        "DESC_TAREA": DESC_TAREA
                    })

                except Exception as fila_error:

                    errores.append({
                        "fila": int(index)+2,
                        "mensaje": str(fila_error)
                    })

        session['filas_validas'] = filas_validas

        return jsonify({
            "total_filas": len(df),
            "filas_validas": len(filas_validas),
            "total_horas": total_horas,
            "errores": errores
        })

    except Exception as e:
        import traceback
        print("ERROR EN PREVIEW")
        traceback.print_exc()  
        return jsonify({'error': str(e)}), 500


# =========================
# CONFIRMAR E INSERTAR
# =========================

@app.route('/confirm-horas', methods=['POST'])
def confirm_horas():

    filas_validas = session.get('filas_validas')

    if not filas_validas:
        return jsonify({"error": "No hay datos para confirmar"}), 400

    try:

        with engine.begin() as conn:

            for fila in filas_validas:
                
                fila["FECHA"] = pd.to_datetime(fila["FECHA"]).date()
                existe = conn.execute(
                    text("""
                    SELECT 1 
                    FROM HORAS_TRAB
                    WHERE ID_SOCIEDAD = :ID_SOCIEDAD
                    AND ID_EMPLEADO = :ID_EMPLEADO
                    AND FECHA = :FECHA
                    AND ID_CLIENTE = :ID_CLIENTE
                    AND ID_PROYECTO = :ID_PROYECTO
                    """),
                    fila
                ).fetchone()

                if not existe:

                    conn.execute(
                        text("""
                        INSERT INTO HORAS_TRAB
                        (ID_SOCIEDAD, ID_EMPLEADO, FECHA, ID_CLIENTE, ID_PROYECTO, HORAS_DIA, DESC_TAREA)
                        VALUES
                        (:ID_SOCIEDAD, :ID_EMPLEADO, :FECHA, :ID_CLIENTE, :ID_PROYECTO, :HORAS_DIA, :DESC_TAREA)
                        """),
                        fila
                    )

        session.pop('filas_validas', None)

        return jsonify({
            "mensaje": "Horas registradas correctamente"
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# =========================
# EJECUCIÓN APP
# =========================

if __name__ == '__main__':
    app.run(debug=True, port=5000)