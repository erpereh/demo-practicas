class Cliente:
    def __init__(self, id_sociedad, id_cliente, n_cliente, cif, persona_contacto, direccion, activo=True):
        self.id_sociedad = id_sociedad
        self.id_cliente = id_cliente
        self.n_cliente = n_cliente
        self.cif = cif
        self.persona_contacto = persona_contacto
        self.direccion = direccion
        self.activo = activo