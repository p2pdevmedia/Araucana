import data from "./data/sma-street-references.json";
import { airportSearchLocality, normalizePlaceText } from "./place-search-area";
import type { AirportPlaceSuggestion } from "./place-suggestions";

const abbreviations: Record<string, string> = {
  avenida: "av", pasaje: "pje", boulevard: "blvd", doctor: "dr", general: "gral",
  teniente: "tte", coronel: "cnel", capitan: "cap", sargento: "sgto"
};

export function streetKey(value: string) {
  return normalizePlaceText(value).split(" ").map(word => abbreviations[word] ?? word).join(" ");
}

/**
 * Palabras que el nomenclador agrega o quita según la fuente: GeoRef registra
 * «Teniente Coronel Pérez» y el vecino escribe «Pérez». Se comparan en el
 * espacio de `streetKey`, así que las formas largas ya vienen abreviadas.
 */
const titles = new Set([
  "av", "avenida", "blvd", "boulevard", "pje", "pasaje", "calle",
  "dr", "doctor", "dra", "doctora", "gral", "general", "cnel", "coronel",
  "tte", "teniente", "cap", "capitan", "sgto", "sargento", "ing", "ingeniero",
  "pres", "presidente", "fray", "padre", "monseñor", "monsenor"
]);

const particles = new Set(["de", "del", "la", "las", "los", "el", "y", "e"]);

function wordsOf(value: string) {
  return streetKey(value).split(" ").filter(Boolean);
}

/** Una letra de diferencia: `Curruhinca` / `Curruhuinca`, el caso real del nomenclador. */
function oneTypoApart(left: string, right: string) {
  if (left === right) return true;
  if (Math.min(left.length, right.length) < 5 || Math.abs(left.length - right.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) { i += 1; j += 1; continue; }
    edits += 1;
    if (edits > 1) return false;
    if (left.length > right.length) i += 1;
    else if (right.length > left.length) j += 1;
    else { i += 1; j += 1; }
  }
  return edits + (left.length - i) + (right.length - j) <= 1;
}

/**
 * ¿La calle que devolvió el nomenclador es la que se pidió?
 *
 * Compara palabra por palabra y no por cadena entera: el nombre oficial puede
 * traer el tratamiento delante (`Coronel Rohde` para «Rohde») o una letra de
 * diferencia (`Cacique Curruhuinca` para «Curruhinca»), pero **no** puede
 * cambiar la palabra que distingue una calle de su homónima: «Doctor Ficticio
 * Perez» no es «Teniente Coronel Perez» aunque compartan la última palabra y la
 * altura (#352).
 */
export function sameStreetName(requested: string, official: string) {
  const asked = wordsOf(requested).filter((word) => !titles.has(word) && !particles.has(word));
  if (!asked.length) return false;
  const offered = wordsOf(official);
  return asked.every((word) => offered.some((candidate) => oneTypoApart(word, candidate)));
}

const references = new Map(Object.entries(data.streets).map(([name, entry]) => [streetKey(name), entry]));

function onSide(height: number, start: number, end: number) {
  return start > 0 && end > 0 && height >= Math.min(start, end) && height <= Math.max(start, end)
    && (start % 2 !== end % 2 || height % 2 === start % 2);
}

/** Los puntos son centros sobre el trazado de cuadras de GeoRef. Las calles homónimas se excluyen. */
export function localStreetReference(street: string, number: string, locality: string): AirportPlaceSuggestion | null {
  if (normalizePlaceText(locality) !== normalizePlaceText(airportSearchLocality)) return null;
  const entry = references.get(streetKey(street));
  if (!entry) return null;
  const height = Number(number);
  const blocks = entry.blocks.filter(([a, b, c, d]) => onSide(height, a, b) || onSide(height, c, d));
  const [lat, lng] = blocks.length === 1 ? blocks[0].slice(4) : entry.point;
  return {
    label: `${street} ${number}, ${airportSearchLocality}`,
    point: [lat, lng], approximate: true, precision: blocks.length === 1 ? "interpolated" : "street",
    source: "georef", coordinateSourceUrl: data.sourceUrl
  };
}
