ALTER TABLE "DriverVehicleLocation"
ADD COLUMN IF NOT EXISTS "altitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "altitudeAccuracy" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "batteryLevel" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "batteryCharging" BOOLEAN,
ADD COLUMN IF NOT EXISTS "clientNetworkType" TEXT,
ADD COLUMN IF NOT EXISTS "distanceFromPreviousMeters" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "secondsFromPrevious" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "reportedSpeedKmh" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "inferredSpeedKmh" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "isStopped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "stoppedDurationSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "stopStartedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "DriverLocationSample" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "altitudeAccuracy" DOUBLE PRECISION,
    "batteryLevel" DOUBLE PRECISION,
    "batteryCharging" BOOLEAN,
    "clientNetworkType" TEXT,
    "distanceFromPreviousMeters" DOUBLE PRECISION,
    "secondsFromPrevious" DOUBLE PRECISION,
    "reportedSpeedKmh" DOUBLE PRECISION,
    "inferredSpeedKmh" DOUBLE PRECISION,
    "isStopped" BOOLEAN NOT NULL DEFAULT false,
    "stoppedDurationSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stopStartedAt" TIMESTAMP(3),
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverLocationSample_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DriverLocationSample_driverId_recordedAt_idx" ON "DriverLocationSample"("driverId", "recordedAt");
CREATE INDEX IF NOT EXISTS "DriverLocationSample_vehicleId_recordedAt_idx" ON "DriverLocationSample"("vehicleId", "recordedAt");
CREATE INDEX IF NOT EXISTS "DriverLocationSample_isStopped_idx" ON "DriverLocationSample"("isStopped");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DriverLocationSample_driverId_fkey'
  ) THEN
    ALTER TABLE "DriverLocationSample"
    ADD CONSTRAINT "DriverLocationSample_driverId_fkey"
    FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DriverLocationSample_vehicleId_fkey'
  ) THEN
    ALTER TABLE "DriverLocationSample"
    ADD CONSTRAINT "DriverLocationSample_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
