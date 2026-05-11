# Araucana

Aplicacion base con Next.js, Prisma y SQLite.

## Usuario inicial

- Email: `kevin@jefe.com`
- Password: `kieroMoverElBote`

## API compartida

La web, iPhone SwiftUI y Android deben usar la misma API JSON:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users`

Para web, el login guarda una cookie `HttpOnly`. Para iPhone y Android, el mismo
endpoint devuelve `token`; las apps deben enviarlo como:

```http
Authorization: Bearer <token>
```

## Desarrollo

```bash
npm install
npm run prisma:push
npm run prisma:seed
npm run dev
```
