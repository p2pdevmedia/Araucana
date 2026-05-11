export type StopRow = {
  name: string;
  km: string;
  minutes: string;
  note: string;
};

export const emptyStopRow: StopRow = {
  name: "",
  km: "0",
  minutes: "0",
  note: ""
};

function numericText(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : "0";
}

export function normalizeStopRows(stops: unknown): StopRow[] {
  if (!Array.isArray(stops)) {
    return [];
  }

  return stops
    .map((stop) => {
      if (!stop || typeof stop !== "object") {
        return null;
      }

      const item = stop as { name?: unknown; km?: unknown; minutes?: unknown; note?: unknown };
      const name = String(item.name ?? "").trim();

      if (!name) {
        return null;
      }

      return {
        name,
        km: numericText(item.km),
        minutes: numericText(item.minutes),
        note: String(item.note ?? "").trim()
      };
    })
    .filter((stop): stop is StopRow => Boolean(stop));
}

export function serializeStopRows(rows: StopRow[]) {
  return rows
    .map((row) => {
      const name = row.name.trim();

      if (!name) {
        return "";
      }

      return [
        name,
        numericText(row.km.trim()),
        numericText(row.minutes.trim()),
        row.note.trim()
      ].join(" | ");
    })
    .filter(Boolean)
    .join("\n");
}
