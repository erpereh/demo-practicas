class Banco:
    def __init__(self, id_sociedad, id_banco_cobro, n_banco_cobro, num_cuenta, codigo_iban, activo=True):
        self.id_sociedad = id_sociedad
        self.id_banco_cobro = id_banco_cobro
        self.n_banco_cobro = n_banco_cobro
        self.num_cuenta = num_cuenta
        self.codigo_iban = codigo_iban
        self.activo = activo