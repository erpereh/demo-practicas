from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pandas as pd
from sqlalchemy import create_engine, text

app = Flask(__name__)
app.secret_key = "super_secret_key"

# Permitir conexión desde frontend
CORS(app, supports_credentials=True)

# =========================
# CONFIGURACIÓN BASE DATOS
# =========================
DB_USER = 'root'
DB_PASS = '1234'
DB_HOST = 'localhost'
DB_NAME = 'gestion_empresa'

engine = create_engine(
    f'mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}'
)

# =========================
# PREVISUALIZACIÓN (NO GUARDA)
# =========================
@app.route('/preview-horas', methods=['POST'])
def preview_horas():

    if 'archivo' not in request.files:
        return jsonify({'error': 'No se recibió archivo'}), 400

    archivo = request.files['archivo']

    try:
        df = pd.read_excel(archivo)

        filas_validas = []
        errores = []
        total_horas = 0

        for index, fila in df.iterrows():
            ID_SOCIEDAD = fila.get('ID_SOCIEDAD')
            ID_EMPLEADO = fila.get('ID_EMPLEADO')
            FECHA = pd.to_datetime(fila.get('FECHA'), dayfirst=True).date()
            ID_CLIENTE = fila.get('ID_CLIENTE')
            ID_PROYECTO = fila.get('ID_PROYECTO')
            HORAS_DIA = fila.get('HORAS_DIA')
            DESC_TAREA = fila.get('DESC_TAREA', '')

            with engine.connect() as conn:
                empleado = conn.execute(
                    text("SELECT 1 FROM EMPLEADOS WHERE ID_EMPLEADO = :id"),
                    {"id": ID_EMPLEADO}
                ).fetchone()

                cliente = conn.execute(
                    text("SELECT 1 FROM CLIENTES WHERE ID_CLIENTE = :id"),
                    {"id": ID_CLIENTE}
                ).fetchone()

                proyecto = conn.execute(
                    text("""SELECT 1 FROM PROYECTOS 
                            WHERE ID_PROYECTO = :id_proyecto 
                            AND ID_CLIENTE = :id_cliente"""),
                    {
                        "id_proyecto": ID_PROYECTO,
                        "id_cliente": ID_CLIENTE
                    }
                ).fetchone()

            if not empleado:
                errores.append({"fila": int(index)+2, "mensaje": "Empleado no existe"})
                continue

            if not cliente:
                errores.append({"fila": int(index)+2, "mensaje": "Cliente no existe"})
                continue

            if not proyecto:
                errores.append({
                    "fila": int(index)+2,
                    "mensaje": "Proyecto no pertenece al cliente"
                })
                continue

            if pd.isna(FECHA) or pd.isna(HORAS_DIA):
                errores.append({
                    "fila": int(index)+2,
                    "mensaje": "Faltan fecha u horas"
                })
                continue

            total_horas += float(HORAS_DIA)

            filas_validas.append({
                "ID_SOCIEDAD": ID_SOCIEDAD,
                "ID_EMPLEADO": ID_EMPLEADO,
                "FECHA": FECHA,
                "ID_CLIENTE": ID_CLIENTE,
                "ID_PROYECTO": ID_PROYECTO,
                "HORAS_DIA": HORAS_DIA,
                "DESC_TAREA": DESC_TAREA
            })

        session['filas_validas'] = filas_validas

        return jsonify({
            "total_filas": len(df),
            "filas_validas": len(filas_validas),
            "total_horas": total_horas,
            "errores": errores
        })

    except Exception as e:
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

        # 👇 IMPORTANTE: esto va dentro de la función
        for fila in filas_validas:
            fila["FECHA"] = pd.to_datetime(fila["FECHA"]).date()

        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO HORAS_TRAB
                    (ID_SOCIEDAD, ID_EMPLEADO, FECHA, ID_CLIENTE, ID_PROYECTO, HORAS_DIA, DESC_TAREA)
                    VALUES (:ID_SOCIEDAD, :ID_EMPLEADO, :FECHA, :ID_CLIENTE, :ID_PROYECTO, :HORAS_DIA, :DESC_TAREA)
                """),
                filas_validas
            )

        session.pop('filas_validas', None)

        return jsonify({"mensaje": "Horas registradas correctamente"})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)