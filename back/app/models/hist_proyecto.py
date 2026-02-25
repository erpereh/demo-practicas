class HistProyecto:
    def __init__(self,id_sociedad,id_empleado,id_cliente,id_proyecto,fec_inicio,tarifa,activo=True):
        self.id_sociedad = id_sociedad
        self.id_empleado = id_empleado
        self.id_cliente = id_cliente
        self.id_proyecto = id_proyecto
        self.fec_inicio = fec_inicio
        self.tarifa = tarifa
        self.activo = activo