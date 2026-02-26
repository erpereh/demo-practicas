from datetime import datetime

class HorasTrab:
    def __init__(self, id_sociedad, id_empleado, fecha, id_cliente, id_proyecto, horas_dia, desc_tarea, origen="MANUAL", estado="PENDIENTE"):
        from datetime import datetime

        self.id_sociedad = id_sociedad
        self.id_empleado = id_empleado
        self.fecha = datetime.strptime(fecha, "%Y-%m-%d")
        self.id_cliente = id_cliente
        self.id_proyecto = id_proyecto
        self.horas_dia = horas_dia
        self.desc_tarea = desc_tarea
        self.origen = origen
        self.estado = estado