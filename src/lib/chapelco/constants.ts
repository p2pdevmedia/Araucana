export const CHAPELCO_BOOKING_MODE = "CHAPELCO";
export const chapelcoAscentSlots = ["08:30", "09:00", "10:30", "12:00"] as const;
export const chapelcoActiveReservationStatuses = ["PENDING_PAYMENT", "CONFIRMED"] as const;
export const chapelcoRunDirections = ["UP", "DOWN"] as const;
export const chapelcoManifestStatuses = ["PENDING", "BOARDED", "NO_SHOW", "TRANSPORTED"] as const;

export type ChapelcoAscentSlot = (typeof chapelcoAscentSlots)[number];
export type ChapelcoRunDirection = (typeof chapelcoRunDirections)[number];
export type ChapelcoManifestStatus = (typeof chapelcoManifestStatuses)[number];
