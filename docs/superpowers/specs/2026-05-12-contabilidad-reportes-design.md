# Contabilidad Y Reportes Design

## Objetivo

Agregar una parte contable al panel de Araucana para ver ingresos automaticos desde reservas pagadas/confirmadas, cargar egresos operativos y registrar pagos de sueldos a secretarias y choferes. La primera version busca claridad diaria: cuanto entro, cuanto salio, por que concepto, por nave y por persona.

## Alcance Aprobado

- Nueva seccion `Contabilidad` en el admin.
- Nueva seccion `Reportes` en el admin.
- Los ingresos no se cargan manualmente: se calculan desde reservas pagadas o confirmadas.
- Los egresos se cargan manualmente con fecha, monto, categoria, nave opcional, usuario opcional y nota.
- Secretarias y choferes tienen un sueldo mensual guardado en su usuario.
- Cuando se paga un sueldo, se guarda un egreso real con usuario, periodo, fecha de pago y monto pagado.
- Los pagos historicos de sueldo no cambian si luego se actualiza el sueldo mensual del usuario.

## Modelo Contable

Los ingresos se derivan de reservas existentes:

- Una reserva cuenta como ingreso si su estado esta confirmado o si su pago esta aprobado.
- El monto del ingreso usa `Reservation.totalCents`.
- La fecha contable inicial usa `Payment.updatedAt` cuando el pago esta aprobado; si no existe pago aprobado, usa la fecha de creacion de la reserva confirmada.
- La nave del ingreso se obtiene desde `Reservation -> Schedule -> Vehicle`.
- La ruta y salida quedan disponibles para reportes desde la misma relacion.

Los egresos se guardan como movimientos contables propios:

- `type`: egreso.
- `category`: sueldo secretaria, sueldo chofer, arreglo, nafta, seguro, peaje, limpieza u otros.
- `amountCents` y `currency`.
- `occurredAt`: fecha contable.
- `vehicleId`: opcional para gastos de nave.
- `userId`: opcional para sueldos.
- `salaryPeriod`: opcional para pagos de sueldo, con formato mensual.
- `notes`: opcional.
- `createdAt` y `updatedAt`.

Extender `User` para guardar:

- `monthlySalaryCents`: sueldo mensual configurado, opcional.
- `salaryCurrency`: moneda del sueldo, por defecto ARS.

## Experiencia Admin

La navegacion lateral suma:

- `Contabilidad`, visible para ADMIN.
- `Reportes`, visible para ADMIN.

`/admin/contabilidad` muestra:

- Resumen del periodo actual: ingresos automaticos, egresos cargados y saldo.
- Tabla de egresos recientes.
- Formulario para nuevo egreso.
- Acceso rapido para registrar pago de sueldo.

El formulario de egreso permite:

- Elegir categoria.
- Ingresar monto.
- Elegir fecha.
- Asociar nave cuando corresponde, por ejemplo nafta o arreglo.
- Asociar usuario cuando corresponde, por ejemplo sueldo.
- Agregar nota.

El flujo de pago de sueldo permite:

- Elegir secretaria o chofer.
- Mostrar el sueldo mensual configurado como monto sugerido.
- Elegir periodo mensual.
- Elegir fecha de pago.
- Editar el monto antes de guardar.
- Guardar el pago como egreso de sueldo.

Las pantallas de secretarias y choferes agregan el campo `Sueldo mensual` en crear/editar usuario.

## Reportes

`/admin/reportes` muestra filtros por periodo:

- Mes actual por defecto.
- Rango de fechas opcional.
- Filtro por nave opcional.

Reportes iniciales:

- Total ingresos.
- Total egresos.
- Saldo.
- Ingresos por nave.
- Gastos por nave.
- Gastos por categoria.
- Sueldos pagados por persona.

Los reportes deben distinguir visualmente ingresos calculados desde reservas y egresos cargados manualmente, para que el administrador entienda de donde sale cada numero.

## Validaciones

- El monto debe ser mayor a cero.
- La fecha es obligatoria.
- La categoria es obligatoria.
- Un egreso de sueldo debe tener usuario y periodo.
- Un egreso de nave como nafta o arreglo puede tener nave; no es obligatorio para no bloquear cargas incompletas.
- Solo ADMIN puede ver y modificar contabilidad y reportes.
- Los ingresos automaticos no se editan desde contabilidad; se corrigen ajustando reserva o pago.

## Testing

Usar TDD para:

- Calcular ingresos automaticos desde reservas confirmadas o pagos aprobados.
- Excluir reservas pendientes o canceladas sin pago aprobado.
- Sumar egresos por periodo.
- Registrar pago de sueldo con monto sugerido desde el usuario.
- Mantener pagos historicos cuando cambia el sueldo mensual.
- Verificar reportes por nave, categoria y persona.
- Flujo admin para cargar un egreso y verlo reflejado en resumen/reportes.

## Fuera De Alcance

- Facturacion fiscal.
- Caja diaria con apertura/cierre formal.
- Comprobantes adjuntos para egresos.
- Ingresos manuales.
- Deudas o sueldos pendientes calculados automaticamente.
- Exportacion Excel/PDF.
- Multi moneda con conversion.
