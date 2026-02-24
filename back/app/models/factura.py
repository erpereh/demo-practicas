class Factura:
    def __init__(self, id_sociedad, id_cliente, num_factura, fec_factura, concepto, base_imponible, total):
        self.id_sociedad = id_sociedad
        self.id_cliente = id_cliente
        self.num_factura = num_factura
        self.fec_factura = fec_factura
        self.concepto = concepto
        self.base_imponible = base_imponible
        self.total = total