ALTER TABLE "User"
ADD COLUMN "monthlySalaryCents" INTEGER,
ADD COLUMN "salaryCurrency" TEXT NOT NULL DEFAULT 'ARS';

CREATE TABLE "AccountingEntry" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "vehicleId" TEXT,
  "userId" TEXT,
  "salaryPeriod" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AccountingEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AccountingEntry_occurredAt_idx" ON "AccountingEntry"("occurredAt");
CREATE INDEX "AccountingEntry_category_idx" ON "AccountingEntry"("category");
CREATE INDEX "AccountingEntry_vehicleId_idx" ON "AccountingEntry"("vehicleId");
CREATE INDEX "AccountingEntry_userId_idx" ON "AccountingEntry"("userId");
CREATE INDEX "AccountingEntry_salaryPeriod_idx" ON "AccountingEntry"("salaryPeriod");

ALTER TABLE "AccountingEntry"
ADD CONSTRAINT "AccountingEntry_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AccountingEntry"
ADD CONSTRAINT "AccountingEntry_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
