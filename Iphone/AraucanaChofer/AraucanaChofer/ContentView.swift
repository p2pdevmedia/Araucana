import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var session: DriverSession

    var body: some View {
        Group {
            if session.isAuthenticated {
                DriverDashboardView()
            } else {
                LoginView()
            }
        }
        .task {
            await session.restore()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(DriverSession())
    }
}
