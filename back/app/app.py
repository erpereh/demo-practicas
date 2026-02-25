from flask import Flask, request, jsonify
import pandas as pd
from sqlalchemy import create_engine, text

app = Flask(__name__)

# Conexión a la base de datos MySQL
DB_USER = 'root'
DB_PASS = '1234'
DB_HOST = 'localhost'
DB_NAME = 'gestion_empresa'

engine = create_engine(f'mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}')

from flask import render_template_string

# Formulario para subir Excel
HTML_FORM = """
<!DOCTYPE html>
<html>
<body>
<h2>Subir Excel de Horas</h2>
<form action="/import-horas" method="post" enctype="multipart/form-data">
  <input type="file" name="archivo" required>
  <button type="submit">Subir Excel</button>
</form>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_FORM)

@app.route('/import-horas', methods=['POST'])
def import_horas():
    if 'archivo' not in request.files:
        return jsonify({'error': 'No se recibió archivo'}), 400

    archivo = request.files['archivo']
    
    try:
        df = pd.read_excel(archivo)

        filas_validas = []
        errores = []

        for index, fila in df.iterrows():
            ID_SOCIEDAD = fila.get('ID_SOCIEDAD')
            ID_EMPLEADO = fila.get('ID_EMPLEADO')
            FECHA = fila.get('FECHA')
            ID_CLIENTE = fila.get('ID_CLIENTE')
            ID_PROYECTO = fila.get('ID_PROYECTO')
            HORAS_DIA = fila.get('HORAS_DIA')
            DESC_TAREA = fila.get('DESC_TAREA', '')

            with engine.connect() as conn:
                empleado = conn.execute(
                    text("SELECT 1 FROM EMPLEADOS WHERE ID_EMPLEADO = :id_empleado"),
                    {"id_empleado": ID_EMPLEADO}
                ).fetchone()

                cliente = conn.execute(
                    text("SELECT 1 FROM CLIENTES WHERE ID_CLIENTE = :id_cliente"),
                    {"id_cliente": ID_CLIENTE}
                ).fetchone()

                proyecto = conn.execute(
                    text("SELECT 1 FROM PROYECTOS WHERE ID_PROYECTO = :id_proyecto AND ID_CLIENTE = :id_cliente"),
                    {"id_proyecto": ID_PROYECTO, "id_cliente": ID_CLIENTE}
                ).fetchone()

            # Validaciones
            if not empleado:
                errores.append({'fila': int(index)+2, 'error': 'Empleado no existe'})
                continue
            if not cliente:
                errores.append({'fila': int(index)+2, 'error': 'Cliente no existe'})
                continue
            if not proyecto:
                errores.append({'fila': int(index)+2, 'error': 'Proyecto no existe o no pertenece al cliente'})
                continue
            if pd.isna(FECHA) or pd.isna(HORAS_DIA):
                errores.append({'fila': int(index)+2, 'error': 'Faltan fecha u horas'})
                continue

            filas_validas.append({
                'ID_SOCIEDAD': ID_SOCIEDAD,
                'ID_EMPLEADO': ID_EMPLEADO,
                'FECHA': FECHA,
                'ID_CLIENTE': ID_CLIENTE,
                'ID_PROYECTO': ID_PROYECTO,
                'HORAS_DIA': HORAS_DIA,
                'DESC_TAREA': DESC_TAREA
            })

        # Insertar filas válidas
        if filas_validas:
            with engine.connect() as conn:
                conn.execute(
                    text("""
                        INSERT INTO HORAS_TRAB 
                        (ID_SOCIEDAD, ID_EMPLEADO, FECHA, ID_CLIENTE, ID_PROYECTO, HORAS_DIA, DESC_TAREA)
                        VALUES (:ID_SOCIEDAD, :ID_EMPLEADO, :FECHA, :ID_CLIENTE, :ID_PROYECTO, :HORAS_DIA, :DESC_TAREA)
                    """),
                    filas_validas
                )

        return jsonify({
            'total_filas': len(df),
            'filas_importadas': len(filas_validas),
            'errores': errores
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)