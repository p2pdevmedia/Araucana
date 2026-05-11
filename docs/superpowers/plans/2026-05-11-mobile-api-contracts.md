# Mobile API Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the JSON API ready for native iPhone and Android apps, including admin operations, mobile receipt upload, documented OpenAPI contracts, structured errors, HTTPS guidance, and session refresh.

**Architecture:** Move reusable admin parsing and persistence into `src/lib/admin` so REST route handlers and existing admin UI actions can share behavior over time. Add focused Next.js route handlers under `/api/v1`, keep public reservation endpoints unauthenticated where appropriate, and require admin Bearer tokens for admin endpoints.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Prisma, Zod, Vitest, Vercel Blob.

---

### Task 1: Structured API Errors

**Files:**
- Modify: `src/lib/api/responses.ts`
- Test: `src/lib/api/responses.test.ts`

- [ ] Add tests proving errors include `code`, `message`, and optional `fields`.
- [ ] Implement `jsonError(code, message, status, fields?)`.
- [ ] Update existing call sites to keep current messages and add stable error codes.

### Task 2: Session Refresh

**Files:**
- Modify: `src/lib/auth/service.ts`
- Create: `src/app/api/v1/auth/refresh/route.ts`
- Test: `src/lib/auth/session.test.ts` or `src/lib/auth/service.test.ts`

- [ ] Add tests for session expiry metadata and Bearer token behavior.
- [ ] Implement refresh by deleting the current token and issuing a new 30-day session for the same active user.
- [ ] Document `POST /api/v1/auth/refresh`.

### Task 3: Admin REST Services

**Files:**
- Create: `src/lib/admin/api.ts`
- Create route handlers under `src/app/api/v1/admin`
- Test: `src/lib/admin/api.test.ts`

- [ ] Add tests for route, schedule, vehicle, reservation, and payment approval behavior.
- [ ] Implement route CRUD, schedule CRUD/status, vehicle CRUD/active state, reservation list/detail/passenger update, and payment approval.
- [ ] Ensure all admin handlers call `requireAdminUser(request)`.

### Task 4: Mobile Receipt Upload

**Files:**
- Create: `src/app/api/v1/reservations/[code]/receipt/route.ts`
- Test: `src/lib/payments/receipt-validation.test.ts` plus route-level validation where practical.

- [ ] Accept `multipart/form-data` with a `receipt` file.
- [ ] Reuse `validateReceiptFile`, `storeManualPaymentReceipt`, and `attachManualPaymentReceipt`.
- [ ] Return the updated reservation detail.

### Task 5: OpenAPI/Swagger and HTTPS Notes

**Files:**
- Create: `src/lib/api/openapi.ts`
- Create: `src/app/api/v1/openapi/route.ts`
- Create: `src/app/api/v1/docs/route.ts`
- Modify: `README.md`
- Test: `src/lib/api/openapi.test.ts`

- [ ] Add OpenAPI 3.1 JSON covering public, auth, mobile receipt, and admin endpoints.
- [ ] Add Swagger UI HTML route.
- [ ] Add README notes for production HTTPS and native mobile token storage/refresh.

### Task 6: Verification

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Review `git diff --stat` and key files for accidental unrelated changes.
