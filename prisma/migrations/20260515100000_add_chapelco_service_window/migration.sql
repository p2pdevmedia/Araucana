ALTER TABLE "TravelRoute"
ADD COLUMN "serviceStartDate" TIMESTAMP(3),
ADD COLUMN "serviceEndDate" TIMESTAMP(3);

UPDATE "TravelRoute"
SET
  "serviceStartDate" = TIMESTAMP '2026-06-01 00:00:00',
  "serviceEndDate" = TIMESTAMP '2026-10-15 00:00:00'
WHERE "bookingMode" = 'CHAPELCO' OR "specialType" = 'CHAPELCO';
