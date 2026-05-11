# Araucana Chofer iPhone

Proyecto SwiftUI nativo para la app de choferes.

## Abrir en Xcode

Abrir:

```bash
Iphone/AraucanaChofer/AraucanaChofer.xcodeproj
```

## Base inicial

- App SwiftUI.
- Target iOS 17.
- Bundle ID: `com.araucana.chofer`.
- Login real contra `POST /api/v1/auth/login`.
- Recupera usuario con `GET /api/v1/auth/me`.
- Recupera datos de chofer con `GET /api/v1/driver/bootstrap`.
- Recupera rutas activas con `GET /api/v1/routes`.

## Desarrollo local

Con el servidor web corriendo en la Mac:

```bash
npm run dev
```

En el simulador iPhone usar:

```text
http://127.0.0.1:3000
```

El usuario debe tener rol `DRIVER`.
