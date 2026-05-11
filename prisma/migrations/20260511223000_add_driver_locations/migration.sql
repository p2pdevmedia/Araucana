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
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverVehicleLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverVehicleLocation_driverId_key" ON "DriverVehicleLocation"("driverId");

-- CreateIndex
CREATE INDEX "DriverVehicleLocation_vehicleId_idx" ON "DriverVehicleLocation"("vehicleId");

-- CreateIndex
CREATE INDEX "DriverVehicleLocation_recordedAt_idx" ON "DriverVehicleLocation"("recordedAt");

-- AddForeignKey
ALTER TABLE "DriverVehicleLocation" ADD CONSTRAINT "DriverVehicleLocation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicleLocation" ADD CONSTRAINT "DriverVehicleLocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
