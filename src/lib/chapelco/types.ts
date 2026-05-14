import type { ChapelcoAscentSlot, ChapelcoManifestStatus, ChapelcoRunDirection } from "./constants";

export type ChapelcoAvailabilitySlotDto = {
  slot: ChapelcoAscentSlot;
  totalCapacity: number;
  reservedPeople: number;
  availablePeople: number;
};

export type ChapelcoAvailabilityDto = {
  routeId: string;
  serviceDate: string;
  slots: ChapelcoAvailabilitySlotDto[];
};

export type ChapelcoReservationInput = {
  routeId: string;
  serviceDate: string;
  ascentSlot: ChapelcoAscentSlot;
  passengerCount: number;
  pickupName: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupNotes?: string | null;
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentType: string;
    documentId: string;
    nationality?: string | null;
  };
};

export type OperationDayInput = {
  routeId: string;
  serviceDate: string;
  status?: string;
};

export type VehicleDutyInput = {
  operationDayId: string;
  vehicleId: string;
  driverId?: string | null;
  capacity: number;
  notes?: string | null;
};

export type RunInput = {
  operationDayId: string;
  vehicleDutyId: string;
  direction: ChapelcoRunDirection;
  ascentSlot?: ChapelcoAscentSlot | null;
};

export type AssignReservationInput = {
  runId: string;
  reservationId: string;
};

export type StopStatusInput = {
  stopId: string;
  status: ChapelcoManifestStatus;
};
