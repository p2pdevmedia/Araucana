import Foundation

struct APIErrorEnvelope: Decodable, Error {
    let error: APIErrorDetail
}

struct APIErrorDetail: Decodable {
    let code: String
    let message: String
}

struct AuthSession: Decodable {
    let token: String
    let expiresAt: Date
    let user: APIUser
}

struct UserEnvelope: Decodable {
    let user: APIUser?
}

struct APIUser: Decodable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: String
}

struct RoutesEnvelope: Decodable {
    let routes: [TravelRoute]
}

struct TravelRoute: Decodable, Identifiable {
    let id: String
    let slug: String
    let from: String
    let to: String
    let via: String
    let durationMin: Int
    let priceCents: Int
    let currency: String
}

struct DriverBootstrap: Decodable {
    let user: APIUser
    let vehicles: [DriverVehicle]
    let currentLocation: DriverLocation?
}

struct DriverVehicle: Decodable, Identifiable {
    let id: String
    let name: String
    let brand: String
    let model: String
    let licensePlate: String?
}

struct DriverLocation: Decodable {
    let vehicleId: String
    let vehicleName: String
    let latitude: Double
    let longitude: Double
    let accuracy: Double?
    let heading: Double?
    let speed: Double?
    let recordedAt: Date
    let updatedAt: Date
}

