# Web Reservation Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let travelers complete the full reservation flow on the website without being sent to the mobile app concept page.

**Architecture:** Move booking from static demo data to persisted domain models in Prisma, then expose a small web checkout backed by server actions and shared JSON APIs. The public web flow becomes route search -> route detail -> checkout -> confirmation, while the admin tables read the same persisted schedules and reservations.

**Tech Stack:** Next.js App Router, React server/client components, Prisma, Postgres, Zod, Vitest, Playwright.

---

## File Structure

- Modify `prisma/schema.prisma`: add route, schedule, seat, passenger, reservation, payment, and ticket models.
- Modify `prisma/seed.ts`: seed public routes, schedules, seats, and example reservations into Postgres.
- Create `src/lib/booking/types.ts`: shared booking DTOs and status constants.
- Create `src/lib/booking/repository.ts`: Prisma reads/writes for routes, schedules, seats, reservations, and tickets.
- Create `src/lib/booking/validation.ts`: Zod schemas for checkout input.
- Create `src/lib/booking/codes.ts`: reservation and ticket code generation helpers.
- Create `src/lib/payments/types.ts`: payment provider interface and result types.
- Create `src/lib/payments/manual-provider.ts`: first payment implementation, records a pending/manual payment.
- Create `src/app/reservar/[slug]/actions.ts`: server action that creates a reservation from web checkout input.
- Create `src/app/reservar/[slug]/checkout-form.tsx`: client checkout form with schedule, seat, passenger, and summary state.
- Create `src/app/reservar/[slug]/page.tsx`: checkout page for a selected route.
- Create `src/app/reservas/[code]/page.tsx`: confirmation/ticket page.
- Modify `src/app/page.tsx`: change CTAs from app-oriented wording to web booking wording.
- Modify `src/app/rutas/page.tsx`: search/list page links into route detail and checkout.
- Modify `src/app/rutas/[slug]/page.tsx`: "Reservar asiento" links to `/reservar/[slug]`.
- Modify `src/app/layout.tsx`: remove the public "App" nav emphasis and make "Reservar" point to `/rutas`.
- Modify `src/app/admin/salidas/page.tsx`: read schedules from DB.
- Modify `src/app/admin/reservas/page.tsx`: read reservations from DB.
- Create `src/app/api/v1/routes/route.ts`: mobile/web API list of routes.
- Create `src/app/api/v1/routes/[slug]/route.ts`: mobile/web API route detail.
- Create `src/app/api/v1/schedules/route.ts`: mobile/web API schedule search.
- Create `src/app/api/v1/reservations/route.ts`: mobile/web API reservation creation.
- Create `src/app/api/v1/reservations/[code]/route.ts`: mobile/web API reservation detail.
- Create `src/lib/booking/repository.test.ts`: unit tests for reservation creation and seat conflicts.
- Create `tests/e2e/reservation.spec.ts`: browser test for the full web checkout.

---

## Milestone 1: Persist Booking Data

### Task 1: Add Domain Models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add Prisma models**

Add these models after `Session`:

```prisma
model TravelRoute {
  id          String     @id @default(cuid())
  slug        String     @unique
  from        String
  to          String
  via         String
  durationMin Int
  priceCents  Int
  currency    String     @default("ARS")
  category    String
  description String
  featured    Boolean    @default(false)
  stops       Json
  schedules   Schedule[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Vehicle {
  id        String     @id @default(cuid())
  name      String
  seats     Seat[]
  schedules Schedule[]
  createdAt DateTime   @default(now())
}

model Seat {
  id        String   @id @default(cuid())
  vehicleId String
  vehicle   Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  number    String
  row       Int
  column    Int
  createdAt DateTime @default(now())

  @@unique([vehicleId, number])
}

model Schedule {
  id           String        @id @default(cuid())
  routeId      String
  route        TravelRoute   @relation(fields: [routeId], references: [id], onDelete: Cascade)
  vehicleId    String
  vehicle      Vehicle       @relation(fields: [vehicleId], references: [id])
  departureAt  DateTime
  arrivalAt    DateTime
  status       String        @default("OPEN")
  reservations Reservation[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([routeId, departureAt])
}

model Passenger {
  id           String        @id @default(cuid())
  firstName    String
  lastName     String
  email        String
  phone        String
  documentType String
  documentId   String
  nationality  String?
  reservations Reservation[]
  createdAt    DateTime      @default(now())
}

model Reservation {
  id          String     @id @default(cuid())
  code        String     @unique
  scheduleId  String
  schedule    Schedule   @relation(fields: [scheduleId], references: [id])
  passengerId String
  passenger   Passenger  @relation(fields: [passengerId], references: [id])
  seatNumber  String
  status      String     @default("PENDING_PAYMENT")
  totalCents  Int
  currency    String     @default("ARS")
  payment     Payment?
  ticket      Ticket?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@unique([scheduleId, seatNumber])
  @@index([code])
}

model Payment {
  id            String      @id @default(cuid())
  reservationId String      @unique
  reservation   Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  provider      String
  status        String      @default("PENDING")
  amountCents   Int
  currency      String      @default("ARS")
  externalRef   String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Ticket {
  id            String      @id @default(cuid())
  reservationId String      @unique
  reservation   Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  code          String      @unique
  qrPayload     String
  createdAt     DateTime    @default(now())
}
```

- [ ] **Step 2: Generate migration locally**

Run:

```bash
npx prisma migrate dev --name booking_domain
npm run prisma:generate
```

Expected: Prisma creates a migration and generated client succeeds.

### Task 2: Seed Real Booking Data

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Replace static-only seed with persisted route/schedule data**

Seed one vehicle with 24 seats, all current `routes` from `src/lib/travel-data.ts`, and three schedules:

```ts
const vehicle = await prisma.vehicle.upsert({
  where: { id: "veh-araucana-24" },
  update: {},
  create: { id: "veh-araucana-24", name: "Araucana 24" }
});

for (let index = 1; index <= 24; index += 1) {
  await prisma.seat.upsert({
    where: { vehicleId_number: { vehicleId: vehicle.id, number: String(index).padStart(2, "0") } },
    update: {},
    create: {
      vehicleId: vehicle.id,
      number: String(index).padStart(2, "0"),
      row: Math.ceil(index / 4),
      column: ((index - 1) % 4) + 1
    }
  });
}
```

- [ ] **Step 2: Run seed**

Run:

```bash
npm run prisma:seed
```

Expected: admin user still exists, route/schedule/seat rows exist, seed is idempotent.

---

## Milestone 2: Booking Core

### Task 3: Add Booking Helpers

**Files:**
- Create: `src/lib/booking/types.ts`
- Create: `src/lib/booking/codes.ts`
- Create: `src/lib/booking/validation.ts`

- [ ] **Step 1: Define constants and schemas**

Use status strings:

```ts
export const reservationStatuses = ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED"] as const;
export const scheduleStatuses = ["OPEN", "DOCUMENTATION", "CLOSED"] as const;
export type ReservationStatus = (typeof reservationStatuses)[number];
export type ScheduleStatus = (typeof scheduleStatuses)[number];
```

Checkout schema:

```ts
export const createReservationSchema = z.object({
  scheduleId: z.string().min(1),
  seatNumber: z.string().min(1),
  passenger: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    documentType: z.string().min(1),
    documentId: z.string().min(4),
    nationality: z.string().optional()
  })
});
```

### Task 4: Add Repository

**Files:**
- Create: `src/lib/booking/repository.ts`
- Test: `src/lib/booking/repository.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:

```ts
it("creates a pending reservation with passenger, payment, and ticket");
it("rejects a second reservation for the same schedule and seat");
it("returns occupied seats for a schedule");
```

- [ ] **Step 2: Implement repository functions**

Required exports:

```ts
export async function listPublicRoutes() {}
export async function getPublicRouteBySlug(slug: string) {}
export async function listSchedulesForRoute(routeId: string) {}
export async function getSeatMap(scheduleId: string) {}
export async function createWebReservation(input: CreateReservationInput) {}
export async function getReservationByCode(code: string) {}
export async function listAdminSchedules() {}
export async function listAdminReservations() {}
```

- [ ] **Step 3: Run unit tests**

Run:

```bash
npm test
```

Expected: all Vitest tests pass.

---

## Milestone 3: Web Checkout

### Task 5: Create Checkout Route

**Files:**
- Create: `src/app/reservar/[slug]/page.tsx`
- Create: `src/app/reservar/[slug]/checkout-form.tsx`
- Create: `src/app/reservar/[slug]/actions.ts`

- [ ] **Step 1: Build server page**

Page responsibilities:

```ts
const route = await getPublicRouteBySlug(slug);
const schedules = await listSchedulesForRoute(route.id);
```

Render route summary and pass schedules with seats into `CheckoutForm`.

- [ ] **Step 2: Build client form**

Form sections:

1. Select schedule.
2. Select seat from a stable grid.
3. Enter passenger data.
4. Review price and submit.

Submit payload through server action:

```ts
const result = await createReservationAction({
  scheduleId,
  seatNumber,
  passenger
});
```

On success:

```ts
redirect(`/reservas/${result.code}`);
```

### Task 6: Create Confirmation Page

**Files:**
- Create: `src/app/reservas/[code]/page.tsx`

- [ ] **Step 1: Render ticket detail**

Show:

- reservation code
- route
- departure date/time
- passenger
- seat
- payment status
- QR payload as readable code for now

- [ ] **Step 2: Missing reservation behavior**

Unknown code calls `notFound()`.

---

## Milestone 4: Replace App Detours

### Task 7: Update Public CTAs

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/rutas/page.tsx`
- Modify: `src/app/rutas/[slug]/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Route detail buttons**

Change:

```tsx
<Link className="cream-button" href="/app">Reservar asiento</Link>
<Link className="button" href="/app">Continuar</Link>
```

To:

```tsx
<Link className="cream-button" href={`/reservar/${route.slug}`}>Reservar asiento</Link>
<Link className="button" href={`/reservar/${route.slug}`}>Continuar</Link>
```

- [ ] **Step 2: Home wording**

Replace "Descargar app" with "Reservar online" and point it to `/rutas`.

- [ ] **Step 3: Routes page wording**

Replace "Ver flujo mobile" with "Buscar salidas" or remove the button if duplicated.

---

## Milestone 5: Shared JSON API

### Task 8: Add Public Booking API

**Files:**
- Create: `src/app/api/v1/routes/route.ts`
- Create: `src/app/api/v1/routes/[slug]/route.ts`
- Create: `src/app/api/v1/schedules/route.ts`
- Create: `src/app/api/v1/reservations/route.ts`
- Create: `src/app/api/v1/reservations/[code]/route.ts`

- [ ] **Step 1: Implement endpoints**

Responses:

```http
GET /api/v1/routes
GET /api/v1/routes/sma-bariloche-7-lagos
GET /api/v1/schedules?routeId=<id>
POST /api/v1/reservations
GET /api/v1/reservations/ARC-...
```

Use `createReservationSchema` for POST validation and `jsonError` from `src/lib/api/responses.ts` for 400/404 errors.

- [ ] **Step 2: API contract**

Reservation POST body:

```json
{
  "scheduleId": "schedule-id",
  "seatNumber": "04",
  "passenger": {
    "firstName": "Camila",
    "lastName": "Vidal",
    "email": "camila@example.com",
    "phone": "+5492944000000",
    "documentType": "DNI",
    "documentId": "30111222",
    "nationality": "AR"
  }
}
```

---

## Milestone 6: Admin Reads Real Data

### Task 9: Replace Static Admin Tables

**Files:**
- Modify: `src/app/admin/salidas/page.tsx`
- Modify: `src/app/admin/reservas/page.tsx`
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Use repository reads**

Replace imports from `src/lib/travel-data.ts` with:

```ts
import { listAdminReservations, listAdminSchedules } from "@/lib/booking/repository";
```

- [ ] **Step 2: Keep existing labels**

Admin pages must still show columns "Ruta", "Fecha", "Hora", "Asientos", "Estado", "Codigo", "Pasajero", "Asiento".

---

## Milestone 7: Verification

### Task 10: Add E2E Reservation Flow

**Files:**
- Create: `tests/e2e/reservation.spec.ts`

- [ ] **Step 1: Test the happy path**

Flow:

```ts
await page.goto("/rutas/sma-bariloche-7-lagos");
await page.getByRole("link", { name: "Reservar asiento" }).click();
await expect(page).toHaveURL(/\/reservar\/sma-bariloche-7-lagos$/);
await page.getByLabel("Salida").selectOption({ index: 0 });
await page.getByRole("button", { name: "04" }).click();
await page.getByLabel("Nombre").fill("Camila");
await page.getByLabel("Apellido").fill("Vidal");
await page.getByLabel("Email").fill("camila@example.com");
await page.getByLabel("Telefono").fill("+5492944000000");
await page.getByLabel("Tipo de documento").selectOption("DNI");
await page.getByLabel("Documento").fill("30111222");
await page.getByRole("button", { name: "Confirmar reserva" }).click();
await expect(page).toHaveURL(/\/reservas\/ARC-/);
await expect(page.getByText("Reserva confirmada")).toBeVisible();
await expect(page.getByText("Asiento 04")).toBeVisible();
```

- [ ] **Step 2: Run all checks**

Run:

```bash
npm test
npm run test:e2e
npm run build
```

Expected: unit tests, e2e flow, and production build pass.

---

## Commit Plan

1. `feat: add booking domain models`
2. `feat: seed schedules and seats`
3. `feat: add booking repository`
4. `feat: add web checkout flow`
5. `feat: expose booking api`
6. `feat: connect admin to booking data`
7. `test: cover web reservation flow`

---

## Self-Review

- Spec coverage: web can search, pick route, pick schedule, pick seat, enter passenger, create reservation, create pending payment, show ticket, and avoid app detours.
- Remaining product choice: payment starts as manual/pending provider so the website can complete a reservation now; a real provider can replace `manual-provider.ts` without changing checkout shape.
- Type consistency: reservation statuses, schedule statuses, route slugs, and seat numbers are shared through `src/lib/booking`.
