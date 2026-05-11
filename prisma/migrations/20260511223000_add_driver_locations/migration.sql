-- CreateTable
CREATE TABLE "DriverVehicleLocation" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverVehicleLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverLocationSample" (
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

-- CreateIndex
CREATE UNIQUE INDEX "DriverVehicleLocation_driverId_key" ON "DriverVehicleLocation"("driverId");

-- CreateIndex
CREATE INDEX "DriverVehicleLocation_vehicleId_idx" ON "DriverVehicleLocation"("vehicleId");

-- CreateIndex
CREATE INDEX "DriverVehicleLocation_recordedAt_idx" ON "DriverVehicleLocation"("recordedAt");

-- CreateIndex
CREATE INDEX "DriverLocationSample_driverId_recordedAt_idx" ON "DriverLocationSample"("driverId", "recordedAt");

-- CreateIndex
CREATE INDEX "DriverLocationSample_vehicleId_recordedAt_idx" ON "DriverLocationSample"("vehicleId", "recordedAt");

-- CreateIndex
CREATE INDEX "DriverLocationSample_isStopped_idx" ON "DriverLocationSample"("isStopped");

-- AddForeignKey
ALTER TABLE "DriverVehicleLocation" ADD CONSTRAINT "DriverVehicleLocation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicleLocation" ADD CONSTRAINT "DriverVehicleLocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLocationSample" ADD CONSTRAINT "DriverLocationSample_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLocationSample" ADD CONSTRAINT "DriverLocationSample_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
