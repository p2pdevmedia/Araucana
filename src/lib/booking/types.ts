export const reservationStatuses = ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED"] as const;
export const scheduleStatuses = ["OPEN", "DOCUMENTATION", "CLOSED"] as const;

export type ReservationStatus = (typeof reservationStatuses)[number];
export type ScheduleStatus = (typeof scheduleStatuses)[number];

export type PublicRouteDto = {
  id: string;
  slug: string;
  from: string;
  to: string;
  via: string;
  description: string;
  category: string;
  featured: boolean;
  durationMin: number;
  priceCents: number;
  price: number;
  currency: string;
  stops?: unknown;
};

export type ScheduleOptionDto = {
  id: string;
  route: PublicRouteDto;
  departureAt: Date;
  arrivalAt: Date;
  status: ScheduleStatus | string;
  availableSeats: number;
  totalSeats: number;
  priceCents: number;
  price: number;
  currency: string;
};

export type SeatOptionDto = {
  id: string;
  number: string;
  row: number;
  column: number;
  occupied: boolean;
};

export type SeatMapDto = {
  scheduleId: string;
  vehicleId: string;
  seats: SeatOptionDto[];
};

export type PassengerDto = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentId: string;
  nationality?: string | null;
};

export type PaymentDto = {
  provider: string;
  status: string;
  amountCents: number;
  amount: number;
  currency: string;
  externalRef?: string | null;
};

export type TicketDto = {
  code: string;
  qrPayload: string;
};

export type ReservationDetailDto = {
  id: string;
  code: string;
  status: ReservationStatus | string;
  seatNumber: string;
  totalCents: number;
  total: number;
  currency: string;
  createdAt: Date;
  route: PublicRouteDto;
  schedule: Omit<ScheduleOptionDto, "availableSeats" | "totalSeats">;
  passenger: PassengerDto;
  payment: PaymentDto | null;
  ticket: TicketDto | null;
};

export type AdminScheduleRowDto = {
  id: string;
  route: string;
  routeId: string;
  departureAt: Date;
  arrivalAt: Date;
  status: string;
  availableSeats: number;
  totalSeats: number;
};

export type AdminReservationRowDto = {
  id: string;
  code: string;
  passenger: string;
  route: string;
  departureAt: Date;
  seatNumber: string;
  status: string;
  paymentStatus: string | null;
  createdAt: Date;
};
