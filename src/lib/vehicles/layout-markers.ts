export type VehicleLayoutMarkerType = "AISLE" | "DOOR";

export type VehicleLayoutMarker = {
  type: VehicleLayoutMarkerType;
  row: number;
  column: number;
};

type RawMarker = {
  type?: unknown;
  row?: unknown;
  column?: unknown;
};

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function markerKey(marker: VehicleLayoutMarker) {
  return `${marker.type}-${marker.row}-${marker.column}`;
}

function parseRawMarkers(raw: string): RawMarker[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("Las marcas del plano no son validas.");
  }
}

export function parseLayoutMarkers(raw: string): VehicleLayoutMarker[] {
  const markers: VehicleLayoutMarker[] = parseRawMarkers(raw).map((marker) => {
    if (marker.type !== "AISLE" && marker.type !== "DOOR") {
      throw new Error("Las marcas del plano no son validas.");
    }

    if (!isPositiveInteger(marker.row)) {
      throw new Error("La fila de cada marca debe ser positiva.");
    }

    if (marker.type === "DOOR") {
      if (marker.column !== 0 && marker.column !== -1) {
        throw new Error("Las puertas deben estar en el borde de la nave.");
      }
    } else if (!isPositiveInteger(marker.column)) {
      throw new Error("La columna de cada marca debe ser positiva.");
    }

    return {
      type: marker.type,
      row: marker.row,
      column: marker.column
    };
  });

  const keys = new Set<string>();
  for (const marker of markers) {
    const key = markerKey(marker);

    if (keys.has(key)) {
      throw new Error("No puede haber marcas repetidas en el plano.");
    }

    keys.add(key);
  }

  return markers;
}

export function toggleLayoutMarker(markers: VehicleLayoutMarker[], marker: VehicleLayoutMarker) {
  const key = markerKey(marker);
  const hasMarker = markers.some((item) => markerKey(item) === key);

  if (hasMarker) {
    return markers.filter((item) => markerKey(item) !== key);
  }

  return [...markers, marker];
}
