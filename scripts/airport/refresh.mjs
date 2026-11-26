import { chromium } from '@playwright/test';
import { collectAerolineas } from './ar-schedules.mjs';
import { collectJetSmart } from './ja-schedules.mjs';

const endpoint = 'https://araucana.vercel.app/api/internal/airport-schedules';
const localDay = time => new Date(time - 3 * 3600000).toISOString().slice(0, 10);
const now = Date.now();
const days = Array.from({ length: 35 }, (_, index) => localDay(now + (index + 1) * 86400000));
const batch = { asOf: localDay(now), flights: [], coverage: [] };
const browser = await chromium.launch();
let incomplete = false;
try {
  const results = await Promise.allSettled([
    collectAerolineas(browser, days),
    collectJetSmart(browser, days)
  ]);
  for (const [index, result] of results.entries()) {
    const carrier = index === 0 ? 'AR' : 'JA';
    if (result.status === 'rejected') {
      console.error('Falló la consulta de', carrier, String(result.reason));
      incomplete = true;
      continue;
    }
    const { flights, coverage, warnings = [] } = result.value;
    for (const warning of warnings.slice(0, 10)) console.warn(carrier, JSON.stringify(warning));
    batch.flights.push(...flights);
    batch.coverage.push(...coverage);
    const scopes = new Set(coverage.map(c => c.date + '|' + c.direction));
    console.log(carrier, flights.length, 'lecturas,', scopes.size, 'consultas completas de 70.');
    if (scopes.size < days.length * 2 || !flights.length) incomplete = true;
  }
} finally {
  await browser.close();
}
if (!batch.flights.length) throw new Error('Ninguna fuente devolvió programación fechada.');
const tokenUrl = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
tokenUrl.searchParams.set('audience', endpoint);
const tokenResponse = await fetch(tokenUrl, {
  headers: { Authorization: 'Bearer ' + process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN },
  signal: AbortSignal.timeout(15000)
});
if (!tokenResponse.ok) throw new Error('GitHub no emitió la credencial del workflow.');
const { value: token } = await tokenResponse.json();
const response = await fetch(endpoint, {
  method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
  body: JSON.stringify(batch), signal: AbortSignal.timeout(125000), redirect: 'error'
});
if (!response.ok) throw new Error('Error al conciliar la programación: HTTP ' + response.status);
const result = await response.json();
console.log('Resultado de la conciliación:', JSON.stringify(result));
if (incomplete || result.warnings?.length) {
  throw new Error('Conciliación parcial. Revisá la cobertura y los avisos registrados.');
}
