import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Araucana Chofer")
                        .font(.largeTitle.bold())

                    Text("Gestion de viaje para conductores")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                VStack(alignment: .leading, spacing: 12) {
                    Label("Sin sesion iniciada", systemImage: "person.crop.circle.badge.exclamationmark")
                        .font(.headline)

                    Text("En el siguiente paso conectaremos login, salidas asignadas y ubicacion del chofer usando la API.")
                        .foregroundStyle(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.thinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))

                VStack(alignment: .leading, spacing: 12) {
                    Text("Proxima salida")
                        .font(.headline)

                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("San Martin de los Andes")
                            Text("Bariloche")
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Image(systemName: "bus.fill")
                            .font(.title2)
                            .foregroundStyle(.blue)
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))

                Spacer()
            }
            .padding()
            .navigationTitle("Chofer")
        }
    }
}

#Preview {
    ContentView()
}

