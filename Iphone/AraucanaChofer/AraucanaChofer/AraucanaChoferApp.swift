import SwiftUI

@main
struct AraucanaChoferApp: App {
    @StateObject private var session = DriverSession()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(session)
        }
    }
}
