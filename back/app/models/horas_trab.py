from datetime import datetime

class HorasTrab:
    def __init__(self, id_fichaje, fecha, id_empleado, id_proyecto, horas_total, origen, estado, activo=True):
        self.id_fichaje = id_fichaje
        self.fecha = datetime.strptime(fecha, "%Y-%m-%d").date()
        self.id_empleado = id_empleado
        self.id_proyecto = id_proyecto
        self.horas_total = horas_total
        self.origen = origen
        self.estado = estado
        self.activo = activo