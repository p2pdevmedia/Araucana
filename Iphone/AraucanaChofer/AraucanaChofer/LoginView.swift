import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var session: DriverSession
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Email", text: $email)
                        .textContentType(.username)
                        .autocorrectionDisabled()

                    SecureField("Password", text: $password)
                        .textContentType(.password)
                } header: {
                    Text("Chofer")
                }

                Section {
                    TextField("URL de API", text: $session.apiBaseURL)
                        .autocorrectionDisabled()
                } footer: {
                    Text("Para simulador local usa http://127.0.0.1:3000. En produccion debe ser HTTPS.")
                }

                if let errorMessage = session.errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                    }
                }

                Section {
                    Button {
                        Task {
                            await session.signIn(email: email, password: password)
                        }
                    } label: {
                        if session.isLoading {
                            ProgressView()
                        } else {
                            Text("Ingresar")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .disabled(session.isLoading || email.isEmpty || password.isEmpty)
                }
            }
            .navigationTitle("Araucana Chofer")
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
            .environmentObject(DriverSession())
    }
}
