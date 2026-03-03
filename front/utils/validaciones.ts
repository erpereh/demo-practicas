// VALIDACIÓN CLIENTE
export function validarCliente(cliente: any) {
  if (!cliente.empresa || cliente.empresa.trim().length < 2) {
    return "La empresa es obligatoria y debe tener al menos 2 caracteres";
  }

  if (!cliente.cif || !/^[A-Z]\d{8}$/.test(cliente.cif)) {
    return "El CIF debe tener una letra seguida de 8 números";
  }

  if (!cliente.contacto || cliente.contacto.trim().length < 3) {
    return "El contacto debe tener al menos 3 caracteres";
  }

  if (!cliente.direccion || cliente.direccion.trim().length < 5) {
    return "La dirección es obligatoria";
  }

  return null;
}

// VALIDACIÓN EMPLEADO
export function validarEmpleado(empleado: any) {
  if (!empleado.nombre || empleado.nombre.trim().length < 3) {
    return "El nombre es obligatorio y debe tener al menos 3 caracteres";
  }

  if (!empleado.dni || !/^\d{8}[A-Z]$/.test(empleado.dni)) {
    return "El DNI debe tener 8 números y una letra mayúscula";
  }

  if (!empleado.codigoFichaje || empleado.codigoFichaje.trim().length < 5) {
    return "El código de fichaje debe tener al menos 5 caracteres";
  }

  if (!empleado.estado) {
    return "Debes seleccionar un estado";
  }

  return null;
}