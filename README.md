# Araucana

Aplicacion base con Next.js, Prisma y Postgres/Neon.

## Usuario inicial

- Email: `kevin@jefe.com`
- Password: `kieroMoverElBote`

## API compartida

La web, iPhone SwiftUI y Android deben usar la misma API JSON:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users`
- `GET /api/v1/openapi`
- `GET /api/v1/docs`

Para web, el login guarda una cookie `HttpOnly`. Para iPhone y Android, el mismo
endpoint devuelve `token`; las apps deben enviarlo como:

```http
Authorization: Bearer <token>
```

Los errores de la API tienen formato estable para apps nativas:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisa los campos enviados.",
    "fields": {
      "email": "El email no es valido."
    }
  }
}
```

### Apps nativas

- Guardar el `token` en Keychain (iPhone) o EncryptedSharedPreferences/Keystore (Android).
- Usar `expiresAt` para renovar la sesion con `POST /api/v1/auth/refresh` antes de que venza.
- Subir comprobantes con `POST /api/v1/reservations/{code}/receipt` como `multipart/form-data`, campo `receipt`.
- Consumir endpoints admin con un usuario `ADMIN` y `Authorization: Bearer <token>`.

### Produccion HTTPS

La API de produccion debe servirse por HTTPS. iPhone lo requiere por App Transport
Security y Android tambien debe apuntar al dominio seguro en builds release. No
usar HTTP plano salvo entornos locales de desarrollo.

## Desarrollo

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```
