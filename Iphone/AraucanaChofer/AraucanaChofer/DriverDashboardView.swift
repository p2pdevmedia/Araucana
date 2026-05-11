import SwiftUI

struct DriverDashboardView: View {
    @EnvironmentObject private var session: DriverSession

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

                Section("Rutas desde la base") {
                    if session.routes.isEmpty {
                        Text("No hay rutas activas publicadas.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(session.routes) { route in
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(route.from) -> \(route.to)")
                                    .font(.headline)
                                Text(route.via)
                                    .foregroundStyle(.secondary)
                                Text("\(route.durationMin) min · \(route.currency) \(route.priceCents / 100)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
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
        }
    }
}

struct DriverDashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DriverDashboardView()
            .environmentObject(DriverSession())
    }
}
