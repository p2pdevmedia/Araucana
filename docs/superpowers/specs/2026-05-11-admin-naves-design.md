# Admin Naves Design

## Objetivo

Agregar una pantalla de administrador para cargar y administrar las naves/vehiculos propios de Araucana. Esta primera etapa no se conecta con rutas ni salidas nuevas; se concentra en dejar bien resuelta la carga de flota, capacidad y distribucion de asientos.

## Alcance Aprobado

- Nueva seccion `Naves` en el admin.
- Listado de naves existentes con nombre interno, marca/modelo, capacidad, estado y acciones.
- Formulario para crear y editar una nave.
- Preseleccion por marca/modelo desde una mini base local de plantillas.
- Al elegir plantilla, precargar capacidad y distribucion de asientos.
- Todo lo precargado debe ser editable antes de guardar.
- Mantener la relacion actual `Vehicle` -> `Seat`, porque las salidas ya usan vehiculo y asientos.
- No linkear todavia las naves con rutas ni cambiar el flujo de salidas.

## Mini Base De Plantillas

Las plantillas son datos de ayuda, no fichas tecnicas definitivas. El administrador siempre puede editar capacidad, nombre de asiento y posicion.

Plantillas iniciales sugeridas:

- Mercedes-Benz Sprinter Minibus 19+1: 19 asientos de pasajeros.
- Fiat Ducato Minibus: 16 asientos de pasajeros.
- Iveco Daily Minibus 15+1: 15 asientos de pasajeros.
- Iveco Daily Minibus 18+1: 18 asientos de pasajeros.
- Toyota Hiace Commuter: 15 asientos de pasajeros.
- Toyota Hiace Commuter largo: 17 asientos de pasajeros.
- Renault Master Minibus: 15 asientos de pasajeros.
- Hyundai H350 Bus: 15 asientos de pasajeros.

Las capacidades parten de informacion publica de fabricantes o distribuidores, pero se guardan como plantillas internas editables para evitar depender de un catalogo externo.

## Modelo De Datos

Extender `Vehicle` con metadatos administrativos, conservando `name` como nombre interno visible:

- `brand`: marca seleccionada o escrita manualmente.
- `model`: modelo/version seleccionada o escrita manualmente.
- `licensePlate`: patente o identificador operativo opcional.
- `isActive`: permite ocultar una nave sin borrar historial.
- `templateKey`: plantilla usada originalmente, opcional.
- `updatedAt`: auditoria basica.

Mantener `Seat` con `number`, `row` y `column`. En esta etapa no hace falta crear una entidad separada para espacios vacios; los pasillos se representan por posiciones sin asiento en la grilla del editor.

## Experiencia Admin

La navegacion lateral suma `Naves` entre `Salidas` y `Reservas`.

La pantalla principal muestra:

- Conteos de naves activas, asientos totales y plantillas disponibles.
- Tabla de naves con acciones `Editar`, `Activar/Inactivar` y `Borrar`.
- Si una nave tiene salidas o reservas asociadas, borrar debe inactivarla en lugar de eliminarla.

El formulario muestra:

- Nombre interno.
- Marca.
- Modelo/plantilla.
- Patente o identificador.
- Capacidad.
- Editor visual simple de distribucion.
- Acciones de ayuda: aplicar plantilla, autonumerar y restaurar plantilla.

## Editor De Asientos

El editor debe permitir revisar y modificar la distribucion antes de guardar:

- Mostrar una grilla por filas y columnas.
- Permitir cambiar numeros de asiento.
- Permitir quitar/agregar asientos.
- Recalcular capacidad segun los asientos reales guardados.
- Validar que no haya numeros repetidos.

Para mantener bajo el riesgo inicial, la primera version puede usar una grilla editable con inputs y botones, sin drag and drop.

## Validaciones

- Nombre interno requerido.
- Marca y modelo requeridos cuando se usa plantilla; permitidos manuales si el usuario edita.
- Capacidad final debe ser mayor a cero.
- Cada asiento debe tener numero unico dentro de la nave.
- Fila y columna deben ser enteros positivos.
- No permitir borrar definitivamente una nave con salidas asociadas; inactivarla.

## Testing

Usar TDD para:

- Generacion de layout desde plantilla.
- Validacion de asientos duplicados o invalidos.
- Crear nave con plantilla y guardar asientos.
- Actualizar nave cambiando capacidad/distribucion.
- Flujo e2e admin para ver `Naves`, crear una nave desde plantilla y verla listada.

## Fuera De Alcance

- Asignar naves a rutas automaticamente.
- Recalcular salidas existentes al cambiar una distribucion.
- Catalogo externo online de vehiculos.
- Fichas tecnicas completas de motor, chasis o documentacion.
- Editor drag and drop.
