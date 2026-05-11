# Manual Payment Receipts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let passengers upload manual payment receipts to private Vercel Blob storage and let admins view and validate them from reservations.

**Architecture:** Keep the existing `Payment` record as the manual payment state holder, adding receipt metadata and using server actions for upload/validation. Private Blob files are streamed only through an admin-authenticated route handler.

**Tech Stack:** Next.js App Router, Prisma/Postgres, `@vercel/blob`, Vitest, Playwright.

---

### Task 1: Payment Receipt Data

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260511200000_add_payment_receipts/migration.sql`
- Modify: `src/lib/booking/types.ts`
- Modify: `src/lib/booking/repository.ts`
- Test: `src/lib/booking/repository.test.ts`

- [ ] Write a failing repository test showing `listAdminReservations()` exposes receipt metadata.
- [ ] Add nullable receipt columns to `Payment`.
- [ ] Map receipt metadata into reservation detail and admin rows.
- [ ] Run `npm test -- src/lib/booking/repository.test.ts`.

### Task 2: Passenger Upload Flow

**Files:**
- Create: `src/lib/payments/manual-bank-details.ts`
- Create: `src/lib/payments/receipt-storage.ts`
- Modify: `src/app/reservas/[code]/page.tsx`
- Create: `src/app/reservas/[code]/actions.ts`
- Test: `src/app/reservas/[code]/page.test.ts`

- [ ] Write failing tests for hardcoded bank detail formatting and receipt upload validation.
- [ ] Upload receipt files with `put(pathname, file, { access: "private" })`.
- [ ] Store Blob pathname, URL, filename, content type, size, and upload date on `Payment`.
- [ ] Show bank details and upload state on the confirmation page.
- [ ] Run `npm test -- src/app/reservas/[code]/page.test.ts`.

### Task 3: Admin Review And Validation

**Files:**
- Modify: `src/app/admin/reservas/page.tsx`
- Create: `src/app/admin/reservas/actions.ts`
- Create: `src/app/admin/reservas/[code]/comprobante/route.ts`
- Modify: `src/app/globals.css`
- Test: `src/lib/booking/repository.test.ts`

- [ ] Write failing tests for validating receipt-backed reservations.
- [ ] Add repository methods to approve manual payments and confirm reservations.
- [ ] Add an admin-only receipt route that streams private Blob content with `get(pathname, { access: "private" })`.
- [ ] Add receipt links and a `Validar pago` button in `/admin/reservas`.
- [ ] Run `npm test`.

### Task 4: Verification

- [ ] Run `npm run build`.
- [ ] If a dev server is needed for a visual check, start it and inspect the reservation/admin pages.
