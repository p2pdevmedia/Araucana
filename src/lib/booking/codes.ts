const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createReservationCode(now = new Date(), random = Math.random) {
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const suffix = Array.from({ length: 4 }, () => {
    const index = Math.floor(random() * CODE_ALPHABET.length);
    return CODE_ALPHABET[index] ?? "A";
  }).join("");

  return `ARC-${year}${month}-${suffix}`;
}

export function createTicketCode(reservationCode: string) {
  return `TKT-${reservationCode.toUpperCase()}`;
}
