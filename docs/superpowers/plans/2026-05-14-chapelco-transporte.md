# Chapelco Transporte Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Chapelco as a public special route with per-person reservations, manual payment review, pickup geolocation, daily vehicle capacity, editable driver routes, and ascent/descent checklists.

**Architecture:** Keep the current seated route flow intact. Add a Chapelco domain module that reuses `TravelRoute`, `Reservation`, `Passenger`, `Payment`, `Vehicle`, and `User`, while adding special-operation tables for pickup details, daily vehicle duties, runs, and manifest stops. Chapelco reservations do not use seats; capacity is counted by `Reservation.passengerCount`.

**Tech Stack:** Next.js App Router, React client forms, Prisma/Postgres, Zod, Vitest, Playwright, existing manual receipt upload through Vercel Blob. Add Leaflet/react-leaflet for map point selection.

---

## Confirmed Product Rules

- Chapelco is a public route that passengers can reserve from the website.
- The passenger creates one reservation under one responsible person's name.
- The reservation includes a `passengerCount`; individual passenger names are not collected.
- Price is per person: `TravelRoute.priceCents * passengerCount`.
- There are no numbered seats for Chapelco.
- Pickup is required: hotel/place name, address text, latitude, longitude, optional notes.
- Ascent slots are fixed: `08:30`, `09:00`, `10:30`, `12:00`.
- The `12:00` slot is midday.
- Descent is always included, starts at `17:00`, and runs as vehicles fill.
- A vehicle assigned to one ascent slot cannot serve the immediately following slot, but can serve the next one after that.
- If active reservations consume all capacity for a date/slot, the public checkout blocks new reservations.
- Active capacity includes `PENDING_PAYMENT` and `CONFIRMED` reservations, so a pending payment still holds places until cancelled.
- Secretaries validate payment receipts manually using the current receipt workflow.
- Drivers can edit stop order and mark ascent/descent status.

## File Structure

- Modify `prisma/schema.prisma`: route special type, optional seat reservation fields, passenger count, Chapelco tables.
- Create `prisma/migrations/20260514120000_add_chapelco_operations/migration.sql`: SQL migration.
- Modify `prisma/seed.ts`: seed or update the Chapelco special route.
- Create `src/lib/chapelco/constants.ts`: slots, statuses, labels.
- Create `src/lib/chapelco/validation.ts`: Zod schemas for public reservation, admin operation, driver updates.
- Create `src/lib/chapelco/availability.ts`: capacity math and vehicle-slot conflict logic.
- Create `src/lib/chapelco/repository.ts`: all Chapelco reads/writes.
- Create `src/lib/chapelco/types.ts`: DTOs shared by pages and APIs.
- Create `src/lib/chapelco/availability.test.ts`: unit tests for capacity and vehicle conflicts.
- Create `src/lib/chapelco/repository.test.ts`: repository tests with mocked Prisma-like client.
- Modify `src/lib/booking/types.ts`: allow special reservation details in DTOs.
- Modify `src/lib/booking/validation.ts`: keep normal reservation schema and export Chapelco separately from the new module.
- Modify `src/lib/booking/repository.ts`: make existing mappers tolerate optional seats and include Chapelco details.
- Modify `src/app/reservar/[slug]/page.tsx`: render special checkout when route is Chapelco.
- Create `src/app/reservar/[slug]/chapelco-checkout-form.tsx`: public Chapelco checkout.
- Create `src/app/reservar/[slug]/chapelco-actions.ts`: server action for Chapelco reservation.
- Modify `src/app/reservas/[code]/page.tsx`: show Chapelco summary and pickup details.
- Modify `src/app/admin/reservas/page.tsx`: show passenger count and special pickup/payment context.
- Modify `src/app/admin/reservas/[code]/page.tsx`: show/edit Chapelco reservation details.
- Modify `src/app/admin/reservas/actions.ts`: add approve/reject/cancel paths needed by Chapelco.
- Modify `src/components/admin-shell.tsx`: add `Chapelco` navigation for admin and secretary roles.
- Create `src/app/admin/chapelco/page.tsx`: daily operations dashboard.
- Create `src/app/admin/chapelco/actions.ts`: operation day, vehicle duty, assignment, stop reorder actions.
- Create `src/app/admin/chapelco/operation-board.tsx`: admin UI for date/slot capacity and assignments.
- Create `src/app/admin/chapelco/route-map.tsx`: client map/list for pickups and stop order.
- Modify `src/app/chofer/page.tsx`: show Chapelco manifests alongside location sharing.
- Create `src/app/chofer/chapelco-driver-panel.tsx`: driver manifest UI.
- Create `src/app/chofer/chapelco-actions.ts`: driver reorder/checklist actions.
- Create `src/app/api/v1/chapelco/availability/route.ts`: public availability endpoint for apps/native clients.
- Create `src/app/api/v1/driver/chapelco/route.ts`: driver bootstrap endpoint for mobile clients.
- Modify `src/lib/api/openapi.ts`: document Chapelco availability and driver manifest endpoints.
- Modify `src/app/globals.css`: form, board, manifest, map layout styles.
- Modify `tests/e2e/reservation.spec.ts`: public Chapelco booking/payment receipt path.
- Create `tests/e2e/chapelco-admin.spec.ts`: admin operation assignment and driver checklist path.

---

### Task 1: Data Model And Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260514120000_add_chapelco_operations/migration.sql`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Add Prisma model changes**

Add these fields to `TravelRoute`:

```prisma
  bookingMode String @default("SEATED")
  specialType String?
```

Change these fields on `Reservation`:

```prisma
  scheduleId      String?
  schedule        Schedule? @relation(fields: [scheduleId], references: [id])
  routeId         String?
  route           TravelRoute? @relation(fields: [routeId], references: [id])
  seatId          String?
  seat            Seat? @relation(fields: [seatId], references: [id])
  seatNumber      String?
  passengerCount  Int @default(1)
  bookingMode     String @default("SEATED")
  chapelcoDetails ChapelcoReservationDetails?
  chapelcoStops   ChapelcoManifestStop[]

  @@index([routeId])
  @@index([bookingMode])
```

Update `TravelRoute` relation list:

```prisma
  directReservations Reservation[]
  chapelcoOperationDays ChapelcoOperationDay[]
```

Add these models:

```prisma
model ChapelcoReservationDetails {
  id              String      @id @default(cuid())
  reservationId   String      @unique
  reservation     Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  serviceDate     DateTime
  ascentSlot      String
  pickupName      String
  pickupAddress   String
  pickupLatitude  Float
  pickupLongitude Float
  pickupNotes     String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([serviceDate, ascentSlot])
}

model ChapelcoOperationDay {
  id          String                 @id @default(cuid())
  routeId     String
  route       TravelRoute            @relation(fields: [routeId], references: [id], onDelete: Cascade)
  serviceDate DateTime
  status      String                 @default("OPEN")
  vehicleDuties ChapelcoVehicleDuty[]
  runs        ChapelcoRun[]
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt

  @@unique([routeId, serviceDate])
  @@index([serviceDate])
}

model ChapelcoVehicleDuty {
  id             String               @id @default(cuid())
  operationDayId String
  operationDay   ChapelcoOperationDay @relation(fields: [operationDayId], references: [id], onDelete: Cascade)
  vehicleId      String
  vehicle        Vehicle              @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  driverId       String?
  driver         User?                @relation(fields: [driverId], references: [id], onDelete: SetNull)
  capacity       Int
  status         String               @default("ACTIVE")
  notes          String?
  runs           ChapelcoRun[]
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  @@unique([operationDayId, vehicleId])
  @@index([driverId])
}

model ChapelcoRun {
  id             String                 @id @default(cuid())
  operationDayId String
  operationDay   ChapelcoOperationDay   @relation(fields: [operationDayId], references: [id], onDelete: Cascade)
  vehicleDutyId  String
  vehicleDuty    ChapelcoVehicleDuty    @relation(fields: [vehicleDutyId], references: [id], onDelete: Cascade)
  direction      String
  ascentSlot     String?
  sequence       Int                    @default(1)
  status         String                 @default("PLANNED")
  stops          ChapelcoManifestStop[]
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt

  @@index([operationDayId, direction, ascentSlot])
  @@index([vehicleDutyId])
}

model ChapelcoManifestStop {
  id             String      @id @default(cuid())
  runId          String
  run            ChapelcoRun @relation(fields: [runId], references: [id], onDelete: Cascade)
  reservationId  String
  reservation    Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  stopOrder      Int
  passengerCount Int
  pickupName     String
  pickupAddress  String
  pickupLatitude Float
  pickupLongitude Float
  status         String      @default("PENDING")
  driverNotes    String?
  checkedAt      DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@unique([runId, reservationId])
  @@index([reservationId])
  @@index([runId, stopOrder])
}
```

- [ ] **Step 2: Add reverse relations to existing models**

Add to `Vehicle`:

```prisma
  chapelcoDuties ChapelcoVehicleDuty[]
```

Add to `User`:

```prisma
  chapelcoDuties ChapelcoVehicleDuty[]
```

- [ ] **Step 3: Write SQL migration**

The migration must:

```sql
ALTER TABLE "TravelRoute" ADD COLUMN "bookingMode" TEXT NOT NULL DEFAULT 'SEATED';
ALTER TABLE "TravelRoute" ADD COLUMN "specialType" TEXT;

ALTER TABLE "Reservation" ADD COLUMN "routeId" TEXT;
ALTER TABLE "Reservation" ADD COLUMN "passengerCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Reservation" ADD COLUMN "bookingMode" TEXT NOT NULL DEFAULT 'SEATED';
ALTER TABLE "Reservation" ALTER COLUMN "scheduleId" DROP NOT NULL;
ALTER TABLE "Reservation" ALTER COLUMN "seatId" DROP NOT NULL;
ALTER TABLE "Reservation" ALTER COLUMN "seatNumber" DROP NOT NULL;

UPDATE "Reservation"
SET "routeId" = "Schedule"."routeId"
FROM "Schedule"
WHERE "Reservation"."scheduleId" = "Schedule"."id";

ALTER TABLE "Reservation"
ADD CONSTRAINT "Reservation_routeId_fkey"
FOREIGN KEY ("routeId") REFERENCES "TravelRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Reservation_routeId_idx" ON "Reservation"("routeId");
CREATE INDEX "Reservation_bookingMode_idx" ON "Reservation"("bookingMode");

CREATE TABLE "ChapelcoReservationDetails" (
  "id" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "serviceDate" TIMESTAMP(3) NOT NULL,
  "ascentSlot" TEXT NOT NULL,
  "pickupName" TEXT NOT NULL,
  "pickupAddress" TEXT NOT NULL,
  "pickupLatitude" DOUBLE PRECISION NOT NULL,
  "pickupLongitude" DOUBLE PRECISION NOT NULL,
  "pickupNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChapelcoReservationDetails_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChapelcoReservationDetails_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ChapelcoReservationDetails_reservationId_key" ON "ChapelcoReservationDetails"("reservationId");
CREATE INDEX "ChapelcoReservationDetails_serviceDate_ascentSlot_idx" ON "ChapelcoReservationDetails"("serviceDate", "ascentSlot");

CREATE TABLE "ChapelcoOperationDay" (
  "id" TEXT NOT NULL,
  "routeId" TEXT NOT NULL,
  "serviceDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChapelcoOperationDay_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChapelcoOperationDay_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TravelRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ChapelcoOperationDay_routeId_serviceDate_key" ON "ChapelcoOperationDay"("routeId", "serviceDate");
CREATE INDEX "ChapelcoOperationDay_serviceDate_idx" ON "ChapelcoOperationDay"("serviceDate");

CREATE TABLE "ChapelcoVehicleDuty" (
  "id" TEXT NOT NULL,
  "operationDayId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "driverId" TEXT,
  "capacity" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChapelcoVehicleDuty_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChapelcoVehicleDuty_operationDayId_fkey" FOREIGN KEY ("operationDayId") REFERENCES "ChapelcoOperationDay"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChapelcoVehicleDuty_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChapelcoVehicleDuty_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ChapelcoVehicleDuty_operationDayId_vehicleId_key" ON "ChapelcoVehicleDuty"("operationDayId", "vehicleId");
CREATE INDEX "ChapelcoVehicleDuty_driverId_idx" ON "ChapelcoVehicleDuty"("driverId");

CREATE TABLE "ChapelcoRun" (
  "id" TEXT NOT NULL,
  "operationDayId" TEXT NOT NULL,
  "vehicleDutyId" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "ascentSlot" TEXT,
  "sequence" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChapelcoRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChapelcoRun_operationDayId_fkey" FOREIGN KEY ("operationDayId") REFERENCES "ChapelcoOperationDay"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChapelcoRun_vehicleDutyId_fkey" FOREIGN KEY ("vehicleDutyId") REFERENCES "ChapelcoVehicleDuty"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ChapelcoRun_operationDayId_direction_ascentSlot_idx" ON "ChapelcoRun"("operationDayId", "direction", "ascentSlot");
CREATE INDEX "ChapelcoRun_vehicleDutyId_idx" ON "ChapelcoRun"("vehicleDutyId");

CREATE TABLE "ChapelcoManifestStop" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "stopOrder" INTEGER NOT NULL,
  "passengerCount" INTEGER NOT NULL,
  "pickupName" TEXT NOT NULL,
  "pickupAddress" TEXT NOT NULL,
  "pickupLatitude" DOUBLE PRECISION NOT NULL,
  "pickupLongitude" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "driverNotes" TEXT,
  "checkedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChapelcoManifestStop_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChapelcoManifestStop_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ChapelcoRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChapelcoManifestStop_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ChapelcoManifestStop_runId_reservationId_key" ON "ChapelcoManifestStop"("runId", "reservationId");
CREATE INDEX "ChapelcoManifestStop_reservationId_idx" ON "ChapelcoManifestStop"("reservationId");
CREATE INDEX "ChapelcoManifestStop_runId_stopOrder_idx" ON "ChapelcoManifestStop"("runId", "stopOrder");
```

- [ ] **Step 4: Update seed route**

In `prisma/seed.ts`, create or update a route:

```ts
await prisma.travelRoute.upsert({
  where: { slug: "chapelco" },
  update: {
    from: "San Martin de los Andes",
    to: "Chapelco",
    via: "Traslado hotel - Cerro Chapelco - hotel",
    durationMin: 90,
    category: "Invierno",
    bookingMode: "CHAPELCO",
    specialType: "CHAPELCO",
    isActive: true
  },
  create: {
    slug: "chapelco",
    from: "San Martin de los Andes",
    to: "Chapelco",
    via: "Traslado hotel - Cerro Chapelco - hotel",
    durationMin: 90,
    priceCents: 0,
    currency: "ARS",
    category: "Invierno",
    description: "Traslado diario a Chapelco con busqueda por hotel y regreso incluido.",
    featured: true,
    isActive: true,
    bookingMode: "CHAPELCO",
    specialType: "CHAPELCO",
    stops: []
  }
});
```

- [ ] **Step 5: Verify migration**

Run:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Expected: Prisma Client generates successfully and migration applies without altering existing seated reservations incorrectly.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260514120000_add_chapelco_operations/migration.sql prisma/seed.ts
git commit -m "feat: add chapelco operation data model"
```

---

### Task 2: Chapelco Domain Constants, Validation, And Availability

**Files:**
- Create: `src/lib/chapelco/constants.ts`
- Create: `src/lib/chapelco/types.ts`
- Create: `src/lib/chapelco/validation.ts`
- Create: `src/lib/chapelco/availability.ts`
- Create: `src/lib/chapelco/availability.test.ts`

- [ ] **Step 1: Write constants**

```ts
export const CHAPELCO_BOOKING_MODE = "CHAPELCO";
export const chapelcoAscentSlots = ["08:30", "09:00", "10:30", "12:00"] as const;
export const chapelcoActiveReservationStatuses = ["PENDING_PAYMENT", "CONFIRMED"] as const;
export const chapelcoRunDirections = ["UP", "DOWN"] as const;
export const chapelcoManifestStatuses = ["PENDING", "BOARDED", "NO_SHOW", "TRANSPORTED"] as const;

export type ChapelcoAscentSlot = (typeof chapelcoAscentSlots)[number];
```

- [ ] **Step 2: Write DTO types**

Define:

```ts
export type ChapelcoAvailabilitySlotDto = {
  slot: ChapelcoAscentSlot;
  totalCapacity: number;
  reservedPeople: number;
  availablePeople: number;
};

export type ChapelcoReservationInput = {
  routeId: string;
  serviceDate: string;
  ascentSlot: ChapelcoAscentSlot;
  passengerCount: number;
  pickupName: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupNotes?: string | null;
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentType: string;
    documentId: string;
    nationality?: string | null;
  };
};
```

- [ ] **Step 3: Write Zod validation**

`chapelcoReservationSchema` must enforce:

```ts
serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
ascentSlot: z.enum(chapelcoAscentSlots)
passengerCount: z.number().int().min(1).max(60)
pickupName: z.string().min(2).max(120)
pickupAddress: z.string().min(4).max(180)
pickupLatitude: z.number().min(-90).max(90)
pickupLongitude: z.number().min(-180).max(180)
pickupNotes: z.string().max(240).nullable().optional()
passenger: passengerSchema
```

- [ ] **Step 4: Write availability helpers**

Implement:

```ts
export function slotConflicts(existingSlot: ChapelcoAscentSlot, newSlot: ChapelcoAscentSlot) {
  const existingIndex = chapelcoAscentSlots.indexOf(existingSlot);
  const newIndex = chapelcoAscentSlots.indexOf(newSlot);
  return Math.abs(existingIndex - newIndex) === 1 || existingIndex === newIndex;
}

export function vehicleCanServeSlot(existingSlots: ChapelcoAscentSlot[], newSlot: ChapelcoAscentSlot) {
  return existingSlots.every((slot) => !slotConflicts(slot, newSlot));
}

export function availablePeople(totalCapacity: number, reservedPeople: number) {
  return Math.max(totalCapacity - reservedPeople, 0);
}

export function canReservePeople(totalCapacity: number, reservedPeople: number, passengerCount: number) {
  return passengerCount > 0 && reservedPeople + passengerCount <= totalCapacity;
}
```

- [ ] **Step 5: Test vehicle conflict rules**

Test cases:

```ts
expect(vehicleCanServeSlot(["08:30"], "09:00")).toBe(false);
expect(vehicleCanServeSlot(["08:30"], "10:30")).toBe(true);
expect(vehicleCanServeSlot(["09:00"], "10:30")).toBe(false);
expect(vehicleCanServeSlot(["09:00"], "12:00")).toBe(true);
expect(vehicleCanServeSlot(["10:30"], "12:00")).toBe(false);
```

- [ ] **Step 6: Test capacity rules**

Test cases:

```ts
expect(canReservePeople(19, 15, 4)).toBe(true);
expect(canReservePeople(19, 16, 4)).toBe(false);
expect(availablePeople(19, 25)).toBe(0);
```

- [ ] **Step 7: Run tests**

```bash
npm run test -- src/lib/chapelco/availability.test.ts
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/chapelco/constants.ts src/lib/chapelco/types.ts src/lib/chapelco/validation.ts src/lib/chapelco/availability.ts src/lib/chapelco/availability.test.ts
git commit -m "feat: add chapelco availability rules"
```

---

### Task 3: Chapelco Repository

**Files:**
- Create: `src/lib/chapelco/repository.ts`
- Create: `src/lib/chapelco/repository.test.ts`

- [ ] **Step 1: Implement repository functions**

Export these functions:

```ts
export async function getChapelcoRouteBySlug(slug: string) {}
export async function getChapelcoAvailability(routeId: string, serviceDate: string) {}
export async function createChapelcoReservation(input: ChapelcoReservationInput) {}
export async function listChapelcoOperationDay(routeId: string, serviceDate: string) {}
export async function upsertChapelcoOperationDay(input: OperationDayInput) {}
export async function addChapelcoVehicleDuty(input: VehicleDutyInput) {}
export async function assignReservationToRun(input: AssignReservationInput) {}
export async function reorderChapelcoStops(runId: string, orderedStopIds: string[]) {}
export async function updateChapelcoStopStatus(input: StopStatusInput) {}
export async function getDriverChapelcoManifest(driverId: string, serviceDate: string) {}
```

- [ ] **Step 2: Create reservation transaction**

`createChapelcoReservation` must:

1. Parse with `chapelcoReservationSchema`.
2. Load the route and require `bookingMode = "CHAPELCO"`.
3. Read availability for `serviceDate` and `ascentSlot`.
4. Throw `CHAPELCO_CAPACITY_FULL` if `passengerCount` exceeds remaining capacity.
5. Create `Passenger`.
6. Create `Reservation` with:

```ts
{
  code,
  routeId: route.id,
  scheduleId: null,
  seatId: null,
  seatNumber: null,
  passengerId: passenger.id,
  passengerCount: parsed.passengerCount,
  bookingMode: "CHAPELCO",
  status: "PENDING_PAYMENT",
  totalCents: route.priceCents * parsed.passengerCount,
  currency: route.currency
}
```

7. Create `ChapelcoReservationDetails`.
8. Create `Payment` through `manualPaymentProvider.createPendingPayment`.
9. Create `Ticket` with QR payload:

```ts
{
  reservationCode: code,
  ticketCode,
  routeId: route.id,
  bookingMode: "CHAPELCO",
  serviceDate,
  ascentSlot,
  passengerCount
}
```

- [ ] **Step 3: Implement availability query**

Availability should calculate for each slot:

```ts
totalCapacity = sum(capacity of active duties whose existing ascent runs do not conflict with slot)
reservedPeople = sum(passengerCount of active Chapelco reservations for route/date/slot)
availablePeople = max(totalCapacity - reservedPeople, 0)
```

For MVP, if no vehicles are loaded for the date, `totalCapacity` is `0`, so public booking is blocked.

- [ ] **Step 4: Implement admin assignment**

`assignReservationToRun` must:

1. Verify reservation is Chapelco and has matching date/slot for `UP` runs.
2. Verify run capacity is not exceeded.
3. Copy pickup data from `ChapelcoReservationDetails` into `ChapelcoManifestStop`.
4. Use next `stopOrder = max(stopOrder) + 1`.

- [ ] **Step 5: Implement driver reorder/status**

`reorderChapelcoStops` must update contiguous `stopOrder` values starting at `1`.

`updateChapelcoStopStatus` must allow:

```ts
UP: PENDING | BOARDED | NO_SHOW
DOWN: PENDING | TRANSPORTED | NO_SHOW
```

- [ ] **Step 6: Test repository behavior**

Write tests for:

- reservation blocks when capacity is zero.
- reservation creates `passengerCount`, `totalCents`, pickup details, and pending payment.
- pending payment reservations count against capacity.
- vehicle slot conflict blocks immediate next slot.
- assigning a reservation creates a stop with copied pickup data.

- [ ] **Step 7: Run tests**

```bash
npm run test -- src/lib/chapelco/repository.test.ts
```

Expected: all repository tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/chapelco/repository.ts src/lib/chapelco/repository.test.ts
git commit -m "feat: add chapelco reservation repository"
```

---

### Task 4: Make Existing Booking Views Tolerate Special Reservations

**Files:**
- Modify: `src/lib/booking/types.ts`
- Modify: `src/lib/booking/repository.ts`
- Modify: `src/lib/booking/repository.test.ts`
- Modify: `src/app/reservas/[code]/page.tsx`

- [ ] **Step 1: Extend DTOs**

Add to `ReservationDetailDto`:

```ts
bookingMode: string;
passengerCount: number;
seatNumber: string | null;
chapelcoDetails?: {
  serviceDate: Date;
  ascentSlot: string;
  pickupName: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupNotes?: string | null;
} | null;
```

- [ ] **Step 2: Update reservation include**

Include:

```ts
chapelcoDetails: true,
route: true
```

Keep existing `schedule.route` include for seated reservations.

- [ ] **Step 3: Update mapper**

For normal reservations, keep current behavior.

For Chapelco reservations:

```ts
route = reservation.route
schedule = {
  id: "",
  route,
  departureAt: chapelcoDetails.serviceDate,
  arrivalAt: chapelcoDetails.serviceDate,
  status: reservation.status,
  priceCents: reservation.totalCents,
  price: centsToPrice(reservation.totalCents),
  currency: reservation.currency
}
seatNumber = null
```

- [ ] **Step 4: Update public reservation page**

Display Chapelco summary:

- Fecha.
- Horario de subida.
- Cantidad de personas.
- Hotel/lugar.
- Dirección.
- Pago/comprobante panel unchanged.

Replace the seated label `Asiento` with `Cupo` when `bookingMode === "CHAPELCO"`.

- [ ] **Step 5: Test mapper**

Add tests:

- seated reservation still maps seat.
- Chapelco reservation maps pickup and passenger count.
- manual receipt fields still show.

- [ ] **Step 6: Run tests**

```bash
npm run test -- src/lib/booking/repository.test.ts src/app/reservas/[code]/page.test.ts
```

Expected: existing seated tests pass and Chapelco tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/booking/types.ts src/lib/booking/repository.ts src/lib/booking/repository.test.ts src/app/reservas/[code]/page.tsx
git commit -m "feat: show chapelco reservation details"
```

---

### Task 5: Public Chapelco Checkout

**Files:**
- Modify: `src/app/reservar/[slug]/page.tsx`
- Create: `src/app/reservar/[slug]/chapelco-checkout-form.tsx`
- Create: `src/app/reservar/[slug]/chapelco-actions.ts`
- Modify: `src/app/globals.css`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add map dependencies**

```bash
npm install leaflet react-leaflet
```

Expected: dependencies are added to `package.json` and `package-lock.json`.

- [ ] **Step 2: Route special page branch**

In `src/app/reservar/[slug]/page.tsx`:

```tsx
if (route.bookingMode === "CHAPELCO") {
  return <ChapelcoCheckoutForm route={route} initialAvailability={availability} />;
}
```

Normal routes continue rendering `CheckoutForm`.

- [ ] **Step 3: Build checkout form**

Fields:

- service date input.
- ascent slot segmented/select control.
- passenger count stepper/input.
- responsible passenger fields copied from current checkout.
- pickup name.
- pickup address.
- Leaflet map with draggable marker/click-to-set point.
- total price `route.priceCents * passengerCount`.

Submit payload:

```ts
{
  routeId: route.id,
  serviceDate,
  ascentSlot,
  passengerCount,
  pickupName,
  pickupAddress,
  pickupLatitude,
  pickupLongitude,
  pickupNotes,
  passenger: buildPassengerPayload(passenger)
}
```

- [ ] **Step 4: Implement server action**

`createChapelcoReservationAction` must:

1. Validate input.
2. Call `createChapelcoReservation`.
3. `revalidatePath("/reservar/chapelco")`.
4. Return `{ ok: true, code }`.
5. Map `CHAPELCO_CAPACITY_FULL` to: `No quedan cupos para ese dia y horario. Elegi otro horario.`

- [ ] **Step 5: Style checkout**

Add CSS for:

- `.chapelco-slot-grid`
- `.chapelco-map`
- `.pickup-fields`
- `.passenger-count-control`

Keep the existing checkout density and avoid a landing-page style.

- [ ] **Step 6: Test public form helpers**

Add tests in `src/app/reservar/[slug]/checkout-form.test.ts` or a new Chapelco test:

- total updates by passenger count.
- capacity-full error message shows.
- pickup requires coordinates.

- [ ] **Step 7: Run tests**

```bash
npm run test -- 'src/app/reservar/[slug]/checkout-form.test.ts'
npm run build
```

Expected: tests and build pass.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/app/reservar/[slug]/page.tsx src/app/reservar/[slug]/chapelco-checkout-form.tsx src/app/reservar/[slug]/chapelco-actions.ts src/app/globals.css src/app/reservar/[slug]/checkout-form.test.ts
git commit -m "feat: add public chapelco checkout"
```

---

### Task 6: Admin Chapelco Operation Board

**Files:**
- Modify: `src/components/admin-shell.tsx`
- Create: `src/app/admin/chapelco/page.tsx`
- Create: `src/app/admin/chapelco/actions.ts`
- Create: `src/app/admin/chapelco/operation-board.tsx`
- Create: `src/app/admin/chapelco/route-map.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add admin navigation**

Add:

```ts
{ href: "/admin/chapelco", label: "Chapelco", roles: ["ADMIN", "SECRETARY"] }
```

- [ ] **Step 2: Build page data**

`/admin/chapelco` should load:

- Chapelco route.
- selected date from query string or today.
- operation day.
- active vehicles.
- driver users.
- unassigned Chapelco reservations grouped by slot.
- runs and stops.
- capacity per slot.

- [ ] **Step 3: Add actions**

Server actions:

```ts
upsertOperationDayAction(formData)
addVehicleDutyAction(formData)
createRunAction(formData)
assignReservationAction(formData)
reorderStopsAction(formData)
removeStopAction(formData)
```

Each action must call `getCurrentReservationsUserOrRedirect()`.

- [ ] **Step 4: Build board UI**

Sections:

- Date picker.
- Capacity cards for `08:30`, `09:00`, `10:30`, `12:00`.
- Vehicle duties table with vehicle, driver, capacity, assigned slots.
- Unassigned reservations list with pickup, people, payment status.
- Per-run manifest list with stop order and route map.

- [ ] **Step 5: Enforce assignment rules**

Admin assignment must reject:

- reservation with payment status not `APPROVED` if the team chooses only paid reservations for manifests.
- capacity overflow.
- assigning a vehicle to a conflicting slot.
- assigning the same reservation twice to the same direction.

For MVP, allow unapproved reservations to appear in the board but label them `Pago pendiente`; default assignment buttons should be disabled until payment is approved.

- [ ] **Step 6: Run tests**

```bash
npm run test -- src/lib/chapelco/repository.test.ts
```

Expected: admin assignment repository tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin-shell.tsx src/app/admin/chapelco src/app/globals.css
git commit -m "feat: add chapelco admin operations board"
```

---

### Task 7: Admin Reservation Review Enhancements

**Files:**
- Modify: `src/app/admin/reservas/page.tsx`
- Modify: `src/app/admin/reservas/[code]/page.tsx`
- Modify: `src/app/admin/reservas/actions.ts`
- Modify: `src/lib/booking/types.ts`
- Modify: `src/lib/booking/repository.ts`

- [ ] **Step 1: Add list columns**

For Chapelco rows, show:

- route as `Chapelco`.
- seat column as `{passengerCount} personas`.
- pickup name.
- service date and ascent slot.
- payment status.

- [ ] **Step 2: Add detail panel**

On reservation detail page, show:

- responsible passenger.
- passenger count.
- pickup name/address.
- coordinates.
- ascent slot.
- payment receipt.
- assigned run/vehicle if assigned.

- [ ] **Step 3: Add cancellation action**

Add `cancelReservationAction`:

```ts
await prisma.reservation.update({
  where: { code },
  data: { status: "CANCELLED" }
});
```

This releases Chapelco capacity because cancelled reservations are excluded from active capacity.

- [ ] **Step 4: Add tests**

Test that cancelled Chapelco reservations no longer count against capacity.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/reservas src/lib/booking/types.ts src/lib/booking/repository.ts
git commit -m "feat: improve admin review for chapelco reservations"
```

---

### Task 8: Driver Chapelco Manifest

**Files:**
- Modify: `src/app/chofer/page.tsx`
- Create: `src/app/chofer/chapelco-driver-panel.tsx`
- Create: `src/app/chofer/chapelco-actions.ts`
- Create: `src/app/api/v1/driver/chapelco/route.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Load driver manifest**

In `src/app/chofer/page.tsx`, load today's Chapelco runs for the current driver:

```ts
const manifest = await getDriverChapelcoManifest(user.id, todayInSalta());
```

- [ ] **Step 2: Build driver panel**

The panel shows:

- vehicle.
- direction.
- slot or descent sequence.
- ordered stops.
- responsible name.
- phone/WhatsApp.
- pickup name/address.
- passenger count.
- status buttons.

- [ ] **Step 3: Allow route edits**

Drivers can reorder stops with up/down buttons. Each click calls `reorderStopsAction`.

- [ ] **Step 4: Allow checklist updates**

For ascent:

- `Subio`
- `No aparecio`
- `Pendiente`

For descent:

- `Transportado`
- `No aparecio`
- `Pendiente`

- [ ] **Step 5: Add API route**

`GET /api/v1/driver/chapelco?date=YYYY-MM-DD` returns the same manifest for native apps.

`PATCH /api/v1/driver/chapelco` updates stop order or status for a stop owned by the authenticated driver.

- [ ] **Step 6: Run tests**

```bash
npm run test -- src/lib/chapelco/repository.test.ts
```

Expected: driver manifest repository tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/chofer src/app/api/v1/driver/chapelco/route.ts src/app/globals.css
git commit -m "feat: add chapelco driver manifest"
```

---

### Task 9: API And OpenAPI

**Files:**
- Create: `src/app/api/v1/chapelco/availability/route.ts`
- Modify: `src/lib/api/openapi.ts`
- Modify: `src/lib/api/openapi.test.ts`

- [ ] **Step 1: Add public availability endpoint**

`GET /api/v1/chapelco/availability?routeId=ROUTE_ID&date=YYYY-MM-DD`

Response:

```json
{
  "date": "2026-07-15",
  "slots": [
    {
      "slot": "08:30",
      "totalCapacity": 38,
      "reservedPeople": 20,
      "availablePeople": 18
    }
  ]
}
```

- [ ] **Step 2: Add OpenAPI paths**

Document:

- `GET /api/v1/chapelco/availability`
- `GET /api/v1/driver/chapelco`
- `PATCH /api/v1/driver/chapelco`

- [ ] **Step 3: Test OpenAPI**

```bash
npm run test -- src/lib/api/openapi.test.ts
```

Expected: OpenAPI schema includes Chapelco paths.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/v1/chapelco/availability/route.ts src/lib/api/openapi.ts src/lib/api/openapi.test.ts
git commit -m "feat: expose chapelco api contracts"
```

---

### Task 10: End-To-End Verification

**Files:**
- Modify: `tests/e2e/reservation.spec.ts`
- Create: `tests/e2e/chapelco-admin.spec.ts`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Seed realistic data**

Ensure seed creates:

- Chapelco route with non-zero `priceCents`.
- at least two vehicles with seats/capacity.
- one driver user.
- one operation day for a winter date.
- vehicle duties for that day.

- [ ] **Step 2: Public booking e2e**

Test:

1. Visit `/reservar/chapelco`.
2. Select service date.
3. Select `08:30`.
4. Enter `4` people.
5. Enter responsible passenger.
6. Enter pickup name/address.
7. Click map point.
8. Confirm reservation.
9. Land on `/reservas/{code}`.
10. Upload receipt.

- [ ] **Step 3: Secretary validation e2e**

Test:

1. Login as secretary or admin.
2. Visit `/admin/reservas`.
3. Find Chapelco reservation.
4. Validate payment.
5. Verify status becomes `Confirmada`.

- [ ] **Step 4: Admin operation e2e**

Test:

1. Visit `/admin/chapelco`.
2. Select operation date.
3. See capacity by slot.
4. Assign confirmed reservation to a vehicle run.
5. Reorder stop.

- [ ] **Step 5: Driver manifest e2e**

Test:

1. Login as driver.
2. Visit `/chofer`.
3. See assigned Chapelco stop.
4. Mark `Subio`.
5. Reorder if multiple stops.

- [ ] **Step 6: Run full verification**

```bash
npm run test
npm run build
npm run test:e2e
```

Expected: unit tests, build, and e2e tests pass.

- [ ] **Step 7: Commit**

```bash
git add tests/e2e/reservation.spec.ts tests/e2e/chapelco-admin.spec.ts prisma/seed.ts
git commit -m "test: cover chapelco booking operations"
```

---

## Implementation Notes

- Do not let Chapelco changes break the existing seated booking path.
- Keep `PENDING_PAYMENT` Chapelco reservations counted against public capacity until cancellation.
- Do not auto-assign vehicles in the MVP; admin assignment is manual with capacity warnings and hard validation.
- Do not implement waitlist or overbooking in this version.
- Do not require individual passenger documents for Chapelco groups.
- Keep descent flexible: create `DOWN` runs manually as vehicles fill; do not force a fixed descent slot.
- For maps, use click/drag marker as the source of truth. Address geocoding is outside this version.
- Any destructive admin operation should cancel/inactivate instead of deleting records with payment or manifest history.

## Self-Review

- Scope is focused on one special-route module and does not include automatic route optimization.
- Existing normal route reservations remain seated and continue using `Schedule`, `Seat`, and `seatNumber`.
- Chapelco reservations use `routeId`, `passengerCount`, `bookingMode`, and `ChapelcoReservationDetails`.
- Payment receipt upload and manual approval are reused instead of rebuilt.
- Capacity blocking is explicit and includes pending payment reservations.
- Driver route edits are limited to stop ordering and checklist status.
