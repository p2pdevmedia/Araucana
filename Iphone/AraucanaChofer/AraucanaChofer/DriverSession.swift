import Foundation

@MainActor
final class DriverSession: ObservableObject {
    @Published private(set) var user: APIUser?
    @Published private(set) var bootstrap: DriverBootstrap?
    @Published private(set) var routes: [TravelRoute] = []
    @Published var apiBaseURL: String
    @Published var isLoading = false
    @Published var errorMessage: String?

    private var token: String?

    var isAuthenticated: Bool {
        token != nil && user != nil
    }

    init() {
        self.apiBaseURL = UserDefaults.standard.string(forKey: StorageKey.apiBaseURL) ?? "http://127.0.0.1:3000"
        self.token = UserDefaults.standard.string(forKey: StorageKey.token)
    }

    func restore() async {
        guard token != nil, user == nil else {
            return
        }
        await loadAuthenticatedData()
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let client = try makeClient(authenticated: false)
            let session = try await client.login(email: email, password: password)
            guard session.user.role == "DRIVER" else {
                throw DriverAPIError.api("Este usuario no tiene rol de chofer.")
            }
            token = session.token
            user = session.user
            UserDefaults.standard.set(session.token, forKey: StorageKey.token)
            UserDefaults.standard.set(apiBaseURL, forKey: StorageKey.apiBaseURL)
            await loadAuthenticatedData()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func refresh() async {
        await loadAuthenticatedData()
    }

    func signOut() {
        token = nil
        user = nil
        bootstrap = nil
        routes = []
        errorMessage = nil
        UserDefaults.standard.removeObject(forKey: StorageKey.token)
    }

    private func loadAuthenticatedData() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let client = try makeClient(authenticated: true)
            async let userRequest = client.me()
            async let bootstrapRequest = client.driverBootstrap()
            async let routesRequest = client.routes()
            let (loadedUser, loadedBootstrap, loadedRoutes) = try await (userRequest, bootstrapRequest, routesRequest)

            guard loadedUser.role == "DRIVER" else {
                throw DriverAPIError.api("Este usuario no tiene rol de chofer.")
            }

            user = loadedUser
            bootstrap = loadedBootstrap
            routes = loadedRoutes
        } catch {
            errorMessage = error.localizedDescription
            if case DriverAPIError.unauthorized = error {
                signOut()
            }
        }
    }

    private func makeClient(authenticated: Bool) throws -> APIClient {
        guard let url = URL(string: apiBaseURL), url.scheme != nil, url.host != nil else {
            throw DriverAPIError.api("La URL de la API no es valida.")
        }

        return APIClient(baseURL: url, token: authenticated ? token : nil)
    }
}

private enum StorageKey {
    static let token = "araucana.driver.token"
    static let apiBaseURL = "araucana.api.baseURL"
}

