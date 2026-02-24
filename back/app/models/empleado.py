class Empleado:
    def __init__(self, id_empleado, id_empleado_tracker, nombre, apellidos, matricula, fec_alta, activo=True):
        self.id_empleado = id_empleado
        self.id_empleado_tracker = id_empleado_tracker
        self.nombre = nombre
        self.apellidos = apellidos
        self.matricula = matricula
        self.fec_alta = fec_alta
        self.activo = activo