# Contabilidad Y Reportes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build automatic accounting income from paid/confirmed reservations, manual expenses, salary payments, and admin reports.

**Architecture:** Add a focused accounting library that computes income from existing reservation/payment data and stores only manual outflows in a new `AccountingEntry` table. Extend managed users with salary fields, then expose the workflow through admin pages using the existing server-action and admin-shell patterns.

**Tech Stack:** Next.js App Router, React server/client components, Prisma/Postgres, Vitest.

---

### Task 1: Data Model

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260512090000_add_accounting/migration.sql`

- [ ] Add `monthlySalaryCents Int?` and `salaryCurrency String @default("ARS")` to `User`.
- [ ] Add `AccountingEntry` with `category`, `amountCents`, `currency`, `occurredAt`, optional `vehicleId`, optional `userId`, optional `salaryPeriod`, optional `notes`, timestamps, and indexes for date/category/vehicle/user.
- [ ] Add Prisma relations from `User` and `Vehicle` to accounting entries.
- [ ] Create SQL migration matching the schema.
- [ ] Run `npm run prisma:generate`.

### Task 2: Accounting Core With TDD

**Files:**
- Create: `src/lib/accounting/types.ts`
- Create: `src/lib/accounting/period.ts`
- Create: `src/lib/accounting/service.ts`
- Create: `src/lib/accounting/service.test.ts`

- [ ] Write tests for month/range parsing, automatic income inclusion, pending/cancelled exclusion, expense totals, salary payment validation, and report grouping.
- [ ] Run `npm test -- src/lib/accounting/service.test.ts` and verify the tests fail because the library does not exist yet.
- [ ] Implement the accounting library with pure helpers where possible and Prisma-compatible repository functions.
- [ ] Run `npm test -- src/lib/accounting/service.test.ts` and verify it passes.

### Task 3: Managed User Salaries

**Files:**
- Modify: `src/app/admin/users/user-form.tsx`
- Modify: `src/app/admin/users/managed-user-form-page.tsx`
- Modify: `src/app/admin/users/actions.ts`
- Modify: `src/app/admin/users/managed-users-page.tsx`

- [ ] Add a failing test or extend existing admin user tests for parsing salary values.
- [ ] Add `Sueldo mensual` to create/edit forms for secretarias and choferes.
- [ ] Persist salary fields through create/update actions.
- [ ] Show configured salary in the users table.
- [ ] Run the focused admin user test.

### Task 4: Admin Accounting Pages

**Files:**
- Create: `src/app/admin/contabilidad/page.tsx`
- Create: `src/app/admin/contabilidad/actions.ts`
- Create: `src/app/admin/contabilidad/expense-form.tsx`
- Create: `src/app/admin/contabilidad/salary-payment-form.tsx`
- Modify: `src/components/admin-shell.tsx`
- Modify: `src/app/globals.css`

- [ ] Add `Contabilidad` to the admin nav for ADMIN only.
- [ ] Build summary cards for current month income, expenses, and balance.
- [ ] Build recent expenses table.
- [ ] Build manual expense form using server actions.
- [ ] Build salary payment form with suggested salary from selected user.
- [ ] Validate amount/date/category/user/period on the server.

### Task 5: Admin Reports Page

**Files:**
- Create: `src/app/admin/reportes/page.tsx`
- Modify: `src/components/admin-shell.tsx`
- Modify: `src/app/globals.css`

- [ ] Add `Reportes` to the admin nav for ADMIN only.
- [ ] Add period and vehicle filters.
- [ ] Render total income, total expenses, balance, income by vehicle, expenses by vehicle, expenses by category, and salaries by person.

### Task 6: Verification

**Files:**
- Modify as needed only to fix verified failures.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Inspect `git diff --check`.
- [ ] Review changed files against `docs/superpowers/specs/2026-05-12-contabilidad-reportes-design.md`.
