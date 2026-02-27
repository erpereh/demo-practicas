"use client"

import { Landmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cuentasBancarias } from "@/lib/mock-data"

export function CuentasBancariasSection() {
  const totalSaldo = cuentasBancarias.reduce((sum, c) => sum + c.saldo, 0)

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Vision general de las cuentas bancarias de la empresa
      </p>

      {/* Total */}
      <Card className="border border-border bg-card">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Landmark className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo Total</p>
            <p className="text-2xl font-bold text-foreground">
              {totalSaldo.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cuentas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cuentasBancarias.map((cuenta) => (
          <Card key={cuenta.id} className="border border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  {cuenta.banco}
                </CardTitle>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  {cuenta.tipo}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Numero de cuenta</p>
                <p className="font-mono text-sm text-foreground">{cuenta.numeroCuenta}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Titular</p>
                <p className="text-sm text-foreground">{cuenta.titular}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">Saldo disponible</p>
                <p className="text-xl font-bold text-foreground">
                  {cuenta.saldo.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
