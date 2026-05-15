import { chapelcoAscentSlots, type ChapelcoAscentSlot } from "./constants";

export function slotConflicts(existingSlot: ChapelcoAscentSlot, newSlot: ChapelcoAscentSlot) {
  const existingIndex = chapelcoAscentSlots.indexOf(existingSlot);
  const newIndex = chapelcoAscentSlots.indexOf(newSlot);

  return existingIndex === newIndex || Math.abs(existingIndex - newIndex) === 1;
}

export function vehicleCanServeSlot(existingSlots: ChapelcoAscentSlot[], newSlot: ChapelcoAscentSlot) {
  return existingSlots.every((slot) => !slotConflicts(slot, newSlot));
}

export function vehicleCapacityCountsForSlot(existingSlots: ChapelcoAscentSlot[], slot: ChapelcoAscentSlot) {
  return existingSlots.length === 0 || existingSlots.includes(slot) || vehicleCanServeSlot(existingSlots, slot);
}

export function availablePeople(totalCapacity: number, reservedPeople: number) {
  return Math.max(totalCapacity - reservedPeople, 0);
}

export function canReservePeople(totalCapacity: number, reservedPeople: number, passengerCount: number) {
  return passengerCount > 0 && reservedPeople + passengerCount <= totalCapacity;
}

export type ChapelcoReservedSlot = {
  ascentSlot: ChapelcoAscentSlot;
  passengerCount: number;
};

export function reservedPeopleForSlot(reservations: ChapelcoReservedSlot[], slot: ChapelcoAscentSlot) {
  return reservations.reduce(
    (total, reservation) => (reservation.ascentSlot === slot ? total + reservation.passengerCount : total),
    0
  );
}

export function blockingReservedPeopleForSlot(reservations: ChapelcoReservedSlot[], slot: ChapelcoAscentSlot) {
  return reservations.reduce(
    (total, reservation) => (slotConflicts(reservation.ascentSlot, slot) ? total + reservation.passengerCount : total),
    0
  );
}
