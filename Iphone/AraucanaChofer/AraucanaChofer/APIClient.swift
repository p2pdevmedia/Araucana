import Foundation

struct APIClient {
    var baseURL: URL
    var token: String?

    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()

    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()

    func login(email: String, password: String) async throws -> AuthSession {
        try await post(
            "/api/v1/auth/login",
            body: LoginPayload(email: email, password: password),
            authenticated: false
        )
    }

    func me() async throws -> APIUser {
        let envelope: UserEnvelope = try await get("/api/v1/auth/me")
        guard let user = envelope.user else {
            throw DriverAPIError.unauthorized
        }
        return user
    }

    func driverBootstrap() async throws -> DriverBootstrap {
        try await get("/api/v1/driver/bootstrap")
    }

    func routes() async throws -> [TravelRoute] {
        let envelope: RoutesEnvelope = try await get("/api/v1/routes", authenticated: false)
        return envelope.routes
    }

    private func get<T: Decodable>(_ path: String, authenticated: Bool = true) async throws -> T {
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if authenticated {
            try authorize(&request)
        }
        return try await send(request)
    }

    private func post<Body: Encodable, Response: Decodable>(
        _ path: String,
        body: Body,
        authenticated: Bool = true
    ) async throws -> Response {
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(body)
        if authenticated {
            try authorize(&request)
        }
        return try await send(request)
    }

    private func authorize(_ request: inout URLRequest) throws {
        guard let token, !token.isEmpty else {
            throw DriverAPIError.unauthorized
        }
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }

    private func send<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw DriverAPIError.invalidResponse
        }

        if (200..<300).contains(http.statusCode) {
            return try decoder.decode(T.self, from: data)
        }

        if let apiError = try? decoder.decode(APIErrorEnvelope.self, from: data) {
            throw DriverAPIError.api(apiError.error.message)
        }

        throw DriverAPIError.httpStatus(http.statusCode)
    }
}

private struct LoginPayload: Encodable {
    let email: String
    let password: String
}

enum DriverAPIError: LocalizedError {
    case api(String)
    case httpStatus(Int)
    case invalidResponse
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .api(let message):
            return message
        case .httpStatus(let status):
            return "La API respondio con estado \(status)."
        case .invalidResponse:
            return "La respuesta de la API no es valida."
        case .unauthorized:
            return "Necesitas iniciar sesion nuevamente."
        }
    }
}

