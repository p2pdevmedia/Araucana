import { expect, it } from "vitest";
import { sameStreetName } from "./street-reference";

it.each([
  ["Coronel Rohde", "CORONEL ROHDE"],
  ["Rohde", "CORONEL ROHDE"],
  ["Doctor Ernesto Luis Nunez", "Doctor Ernesto Luis Núñez"],
  ["Curruhinca", "CACIQUE CURRUHUINCA"],
  ["prueba", "CALLE DE PRUEBA"]
])("reconoce «%s» en la calle oficial «%s»", (requested, official) => {
  expect(sameStreetName(requested, official)).toBe(true);
});

it.each([
  ["Doctor Ficticio Perez", "TENIENTE CORONEL PEREZ"],
  ["Mariano Moreno", "PERITO MORENO"],
  ["Los Notros", "LOS ARRAYANES"]
])("no confunde «%s» con la homónima «%s»", (requested, official) => {
  expect(sameStreetName(requested, official)).toBe(false);
});
