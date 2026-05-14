-- Add special-route support for Chapelco without changing existing seated reservations.
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
  CONSTRAINT "ChapelcoReservationDetails_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChapelcoOperationDay" (
  "id" TEXT NOT NULL,
  "routeId" TEXT NOT NULL,
  "serviceDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChapelcoOperationDay_pkey" PRIMARY KEY ("id")
);

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
  CONSTRAINT "ChapelcoVehicleDuty_pkey" PRIMARY KEY ("id")
);

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
  CONSTRAINT "ChapelcoRun_pkey" PRIMARY KEY ("id")
);

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
  CONSTRAINT "ChapelcoManifestStop_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChapelcoReservationDetails_reservationId_key" ON "ChapelcoReservationDetails"("reservationId");
CREATE INDEX "ChapelcoReservationDetails_serviceDate_ascentSlot_idx" ON "ChapelcoReservationDetails"("serviceDate", "ascentSlot");

CREATE UNIQUE INDEX "ChapelcoOperationDay_routeId_serviceDate_key" ON "ChapelcoOperationDay"("routeId", "serviceDate");
CREATE INDEX "ChapelcoOperationDay_serviceDate_idx" ON "ChapelcoOperationDay"("serviceDate");

CREATE UNIQUE INDEX "ChapelcoVehicleDuty_operationDayId_vehicleId_key" ON "ChapelcoVehicleDuty"("operationDayId", "vehicleId");
CREATE INDEX "ChapelcoVehicleDuty_driverId_idx" ON "ChapelcoVehicleDuty"("driverId");

CREATE INDEX "ChapelcoRun_operationDayId_direction_ascentSlot_idx" ON "ChapelcoRun"("operationDayId", "direction", "ascentSlot");
CREATE INDEX "ChapelcoRun_vehicleDutyId_idx" ON "ChapelcoRun"("vehicleDutyId");

CREATE UNIQUE INDEX "ChapelcoManifestStop_runId_reservationId_key" ON "ChapelcoManifestStop"("runId", "reservationId");
CREATE INDEX "ChapelcoManifestStop_reservationId_idx" ON "ChapelcoManifestStop"("reservationId");
CREATE INDEX "ChapelcoManifestStop_runId_stopOrder_idx" ON "ChapelcoManifestStop"("runId", "stopOrder");

ALTER TABLE "ChapelcoReservationDetails"
ADD CONSTRAINT "ChapelcoReservationDetails_reservationId_fkey"
FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChapelcoOperationDay"
ADD CONSTRAINT "ChapelcoOperationDay_routeId_fkey"
FOREIGN KEY ("routeId") REFERENCES "TravelRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChapelcoVehicleDuty"
ADD CONSTRAINT "ChapelcoVehicleDuty_operationDayId_fkey"
FOREIGN KEY ("operationDayId") REFERENCES "ChapelcoOperationDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChapelcoVehicleDuty"
ADD CONSTRAINT "ChapelcoVehicleDuty_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChapelcoVehicleDuty"
ADD CONSTRAINT "ChapelcoVehicleDuty_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChapelcoRun"
ADD CONSTRAINT "ChapelcoRun_operationDayId_fkey"
FOREIGN KEY ("operationDayId") REFERENCES "ChapelcoOperationDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChapelcoRun"
ADD CONSTRAINT "ChapelcoRun_vehicleDutyId_fkey"
FOREIGN KEY ("vehicleDutyId") REFERENCES "ChapelcoVehicleDuty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChapelcoManifestStop"
ADD CONSTRAINT "ChapelcoManifestStop_runId_fkey"
FOREIGN KEY ("runId") REFERENCES "ChapelcoRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChapelcoManifestStop"
ADD CONSTRAINT "ChapelcoManifestStop_reservationId_fkey"
FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
