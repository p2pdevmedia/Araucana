# Admin Naves Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin `Naves` screen so operators can create/edit vehicles, pick editable brand/model templates, and manage seat distribution before later linking vehicles to routes.

**Architecture:** Add small vehicle-domain helpers under `src/lib/vehicles`, persist vehicle metadata in Prisma, and follow existing admin patterns with server actions, server-rendered list/edit pages, and one client component for the editable seat grid. Keep `Vehicle` and `Seat` as the source of truth; templates only prefill form state.

**Tech Stack:** Next.js App Router, React, Prisma/PostgreSQL, Vitest, Playwright.

---

### Task 1: Vehicle Template Helpers

**Files:**
- Create: `src/lib/vehicles/templates.ts`
- Test: `src/lib/vehicles/templates.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, test } from "vitest";
import { VEHICLE_TEMPLATES, getVehicleTemplate, normalizeSeats } from "./templates";

describe("vehicle templates", () => {
  test("includes editable templates for common minibus brands", () => {
    expect(VEHICLE_TEMPLATES.map((template) => template.brand)).toEqual(
      expect.arrayContaining(["Mercedes-Benz", "Fiat", "Iveco", "Toyota", "Renault", "Hyundai"])
    );
  });

  test("loads the Mercedes Sprinter 19 passenger layout", () => {
    const template = getVehicleTemplate("mercedes-sprinter-19");

    expect(template?.capacity).toBe(19);
    expect(template?.seats).toHaveLength(19);
    expect(template?.seats[0]).toEqual({ number: "01", row: 1, column: 1 });
  });

  test("normalizes seats by trimming numbers and sorting by position", () => {
    expect(
      normalizeSeats([
        { number: " 02 ", row: 2, column: 1 },
        { number: "01", row: 1, column: 1 }
      ])
    ).toEqual([
      { number: "01", row: 1, column: 1 },
      { number: "02", row: 2, column: 1 }
    ]);
  });
});
```

- [ ] **Step 2: Run red test**

Run: `npm test -- src/lib/vehicles/templates.test.ts`

Expected: FAIL because `src/lib/vehicles/templates.ts` does not exist.

- [ ] **Step 3: Implement minimal helpers**

Create templates with `key`, `brand`, `model`, `capacity`, `columns`, and `seats`, plus `getVehicleTemplate()` and `normalizeSeats()`.

- [ ] **Step 4: Run green test**

Run: `npm test -- src/lib/vehicles/templates.test.ts`

Expected: PASS.

### Task 2: Seat Validation

**Files:**
- Create: `src/lib/vehicles/validation.ts`
- Test: `src/lib/vehicles/validation.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, test } from "vitest";
import { parseSeatLayout } from "./validation";

describe("parseSeatLayout", () => {
  test("accepts a valid editable seat layout", () => {
    expect(parseSeatLayout(JSON.stringify([{ number: "01", row: 1, column: 1 }]))).toEqual([
      { number: "01", row: 1, column: 1 }
    ]);
  });

  test("rejects duplicate seat numbers", () => {
    expect(() =>
      parseSeatLayout(JSON.stringify([
        { number: "01", row: 1, column: 1 },
        { number: "01", row: 1, column: 2 }
      ]))
    ).toThrow("No puede haber asientos repetidos.");
  });

  test("rejects empty layouts", () => {
    expect(() => parseSeatLayout("[]")).toThrow("La nave necesita al menos un asiento.");
  });
});
```

- [ ] **Step 2: Run red test**

Run: `npm test -- src/lib/vehicles/validation.test.ts`

Expected: FAIL because `parseSeatLayout` does not exist.

- [ ] **Step 3: Implement parser**

Parse JSON, require at least one seat, trim numbers, validate positive integer rows/columns, and reject duplicates.

- [ ] **Step 4: Run green test**

Run: `npm test -- src/lib/vehicles/validation.test.ts`

Expected: PASS.

### Task 3: Prisma Metadata

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260511213000_add_vehicle_admin_fields/migration.sql`
- Modify: `prisma/seed.ts`

- [ ] Add `brand`, `model`, `licensePlate`, `templateKey`, `isActive`, and `updatedAt` to `Vehicle`.
- [ ] Add SQL migration with defaults safe for the existing seeded vehicle.
- [ ] Update seed to populate the default Araucana vehicle metadata.
- [ ] Run: `npm run prisma:generate`

### Task 4: Admin Naves CRUD

**Files:**
- Modify: `src/components/admin-shell.tsx`
- Create: `src/app/admin/naves/page.tsx`
- Create: `src/app/admin/naves/nueva/page.tsx`
- Create: `src/app/admin/naves/[id]/page.tsx`
- Create: `src/app/admin/naves/actions.ts`
- Create: `src/app/admin/naves/vehicle-form.tsx`
- Create: `src/app/admin/naves/seat-layout-editor.tsx`

- [ ] Add `Naves` to the admin sidebar.
- [ ] List vehicles with capacity, brand/model, active state, and actions.
- [ ] Build create/edit forms using templates and editable seat layout JSON.
- [ ] Server actions create/update vehicles and replace seats transactionally.
- [ ] Delete action deletes vehicles without schedules; otherwise sets `isActive=false`.

### Task 5: Tests And Verification

**Files:**
- Modify: `tests/e2e/admin.spec.ts`

- [ ] Add `/admin/naves` to admin page coverage.
- [ ] Add an e2e flow that opens `Agregar nave`, chooses a template, saves, and sees the vehicle in the list.
- [ ] Run unit tests: `npm test -- src/lib/vehicles/templates.test.ts src/lib/vehicles/validation.test.ts`
- [ ] Run existing tests impacted by booking/admin: `npm test`
- [ ] Run build: `npm run build`
