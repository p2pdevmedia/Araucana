import SwiftUI

struct DriverDashboardView: View {
    @EnvironmentObject private var session: DriverSession
    @State private var selectedRouteId = ""
    @State private var selectedScheduleId = ""

    private var routes: [DriverRouteOption] {
        session.bootstrap?.routes ?? []
    }

    private var schedules: [DriverSchedule] {
        session.bootstrap?.schedules ?? []
    }

    private var routeSchedules: [DriverSchedule] {
        schedules.filter { $0.routeId == selectedRouteId }
    }

    private var selectedSchedule: DriverSchedule? {
        routeSchedules.first { $0.id == selectedScheduleId } ?? routeSchedules.first
    }

    var body: some View {
        NavigationStack {
            List {
                if let user = session.user {
                    Section("Sesion") {
                        LabeledContent("Email", value: user.email)
                        LabeledContent("Rol", value: user.role)
                    }
                }

                Section("Naves activas") {
                    if let vehicles = session.bootstrap?.vehicles, !vehicles.isEmpty {
                        ForEach(vehicles) { vehicle in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(vehicle.name)
                                    .font(.headline)
                                Text("\(vehicle.brand) \(vehicle.model)")
                                    .foregroundStyle(.secondary)
                                if let licensePlate = vehicle.licensePlate {
                                    Text(licensePlate)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    } else {
                        Text("No hay naves activas disponibles.")
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Ubicacion actual") {
                    if let location = session.bootstrap?.currentLocation {
                        LabeledContent("Nave", value: location.vehicleName)
                        LabeledContent("Latitud", value: location.latitude.formatted())
                        LabeledContent("Longitud", value: location.longitude.formatted())
                        LabeledContent("Actualizada", value: location.updatedAt.formatted(date: .abbreviated, time: .shortened))
                    } else {
                        Text("Todavia no hay ubicacion registrada para este chofer.")
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Ruta de trabajo") {
                    if routes.isEmpty {
                        Text("No hay rutas activas para choferes.")
                            .foregroundStyle(.secondary)
                    } else {
                        Picker("Ruta", selection: $selectedRouteId) {
                            ForEach(routes) { route in
                                Text("\(route.label) · \(route.via)")
                                    .tag(route.id)
                            }
                        }
                    }
                }

                Section("Salidas proximas") {
                    if selectedRouteId.isEmpty {
                        Text("Elegir ruta.")
                            .foregroundStyle(.secondary)
                    } else if routeSchedules.isEmpty {
                        Text("No hay salidas proximas para esta ruta.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(routeSchedules) { schedule in
                            Button {
                                selectedScheduleId = schedule.id
                            } label: {
                                HStack(alignment: .center, spacing: 12) {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(schedule.departureAt.formatted(date: .abbreviated, time: .shortened))
                                            .font(.headline)
                                        Text("\(schedule.vehicle.name) · \(schedule.passengerCount) pasajeros")
                                            .foregroundStyle(.secondary)
                                        Text("Llega \(schedule.arrivalAt.formatted(date: .omitted, time: .shortened))")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }

                                    Spacer()

                                    if selectedSchedule?.id == schedule.id {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundStyle(.green)
                                    }
                                }
                            }
                        }
                    }
                }

                if let selectedSchedule {
                    Section("Detalle de salida") {
                        LabeledContent("Ruta", value: selectedSchedule.routeLabel)
                        LabeledContent("Via", value: selectedSchedule.route.via)
                        LabeledContent("Nave", value: selectedSchedule.vehicle.name)
                        LabeledContent("Patente", value: selectedSchedule.vehicle.licensePlate ?? "Sin patente")
                        LabeledContent("Salida", value: selectedSchedule.departureAt.formatted(date: .abbreviated, time: .shortened))
                        LabeledContent("Llegada", value: selectedSchedule.arrivalAt.formatted(date: .abbreviated, time: .shortened))
                        LabeledContent("Estado", value: scheduleStatusLabel(selectedSchedule.status))
                        LabeledContent("Pasajeros", value: "\(selectedSchedule.passengerCount)")
                        LabeledContent("Asientos disponibles", value: "\(selectedSchedule.availableSeats)/\(selectedSchedule.totalSeats)")
                    }

                    if !selectedSchedule.stops.isEmpty {
                        Section("Paradas de ruta") {
                            ForEach(selectedSchedule.stops) { stop in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(stop.name)
                                        .font(.headline)
                                    Text(stopSubtitle(stop))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }

                    Section("Personas que suben") {
                        if selectedSchedule.passengers.isEmpty {
                            Text("No hay pasajeros para esta salida.")
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(selectedSchedule.passengers) { passenger in
                                VStack(alignment: .leading, spacing: 6) {
                                    Text(passenger.passengerName)
                                        .font(.headline)
                                    Text("\(passenger.code) · Asiento \(passenger.seatNumber ?? "-")")
                                        .foregroundStyle(.secondary)
                                    Text("\(passenger.phone) · \(passenger.documentLabel)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text("\(reservationStatusLabel(passenger.reservationStatus)) · Pago \(paymentStatusLabel(passenger.paymentStatus))")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }

                if let errorMessage = session.errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                    }
                }
            }
            .refreshable {
                await session.refresh()
            }
            .navigationTitle("Chofer")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Salir") {
                        session.signOut()
                    }
                }
            }
            .overlay {
                if session.isLoading && session.bootstrap == nil {
                    ProgressView("Cargando")
                }
            }
            .task {
                normalizeSelection()
            }
            .onChange(of: routes.map(\.id)) {
                normalizeSelection()
            }
            .onChange(of: schedules.map(\.id)) {
                normalizeSelection()
            }
            .onChange(of: selectedRouteId) {
                selectedScheduleId = routeSchedules.first?.id ?? ""
            }
        }
    }

    private func normalizeSelection() {
        if selectedRouteId.isEmpty || !routes.contains(where: { $0.id == selectedRouteId }) {
            selectedRouteId = schedules.first?.routeId ?? routes.first?.id ?? ""
        }

        if !routeSchedules.contains(where: { $0.id == selectedScheduleId }) {
            selectedScheduleId = routeSchedules.first?.id ?? ""
        }
    }

    private func stopSubtitle(_ stop: DriverRouteStop) -> String {
        let minute = stop.minutes.map { "\($0) min" } ?? "Sin minuto"
        guard let note = stop.note, !note.isEmpty else {
            return minute
        }

        return "\(minute) · \(note)"
    }

    private func scheduleStatusLabel(_ status: String) -> String {
        switch status {
        case "OPEN":
            return "Abierta"
        case "DOCUMENTATION":
            return "Documentacion"
        case "CLOSED":
            return "Cerrada"
        default:
            return status
        }
    }

    private func reservationStatusLabel(_ status: String) -> String {
        switch status {
        case "CONFIRMED":
            return "Confirmada"
        case "PENDING_PAYMENT":
            return "Pago pendiente"
        case "CANCELLED":
            return "Cancelada"
        default:
            return status
        }
    }

    private func paymentStatusLabel(_ status: String?) -> String {
        switch status ?? "" {
        case "APPROVED":
            return "aprobado"
        case "PENDING":
            return "pendiente"
        case "REJECTED":
            return "rechazado"
        default:
            return "-"
        }
    }
}

struct DriverDashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DriverDashboardView()
            .environmentObject(DriverSession())
    }
}
