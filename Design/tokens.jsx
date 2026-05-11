// tokens.jsx — Araucana design tokens

const ARAUCANA_LIGHT = {
  // Backgrounds
  bg: '#F1E9D8',         // sand
  surface: '#FBF6EB',    // cream
  surface2: '#E6DCC4',   // warm dune
  surfaceInk: '#1A2522', // near black ink with green warmth
  // Type
  ink: '#1A2522',
  inkSoft: '#3D4D45',
  inkMuted: '#6B7A6E',
  // Brand
  primary: '#1F5B4F',    // logo teal-green
  primaryDeep: '#0E3D34',
  primarySoft: '#D5E1DC',
  accent: '#A05438',     // logo sienna brown
  accentDeep: '#7A3D26',
  // Region palette
  lake: '#0D3B52',
  lakeMid: '#1F5F7F',
  sky: '#A8C5D2',
  moss: '#3E5B3E',
  snow: '#F4F1E6',
  rock: '#787268',
  fire: '#C9633D',
  // System
  line: 'rgba(26, 37, 34, 0.10)',
  lineStrong: 'rgba(26, 37, 34, 0.18)',
  scrim: 'rgba(14, 61, 52, 0.6)',
};

const ARAUCANA_DARK = {
  bg: '#0B1715',
  surface: '#13211E',
  surface2: '#1B2C27',
  surfaceInk: '#F4EDE2',
  ink: '#F1E9D8',
  inkSoft: '#C7CDC5',
  inkMuted: '#8A958B',
  primary: '#6FCFB7',
  primaryDeep: '#1F5B4F',
  primarySoft: '#1F3934',
  accent: '#D88B62',
  accentDeep: '#A05438',
  lake: '#1B4660',
  lakeMid: '#2D6E92',
  sky: '#5E7E8C',
  moss: '#5A8060',
  snow: '#1A2826',
  rock: '#8E867A',
  fire: '#E07A50',
  line: 'rgba(244, 237, 226, 0.10)',
  lineStrong: 'rgba(244, 237, 226, 0.18)',
  scrim: 'rgba(0, 0, 0, 0.65)',
};

const TYPE_SYSTEMS = {
  editorial: {
    label: 'Editorial',
    display: '"Instrument Serif", "DM Serif Display", Georgia, serif',
    body: '"Geist", -apple-system, system-ui, sans-serif',
    mono: '"Geist Mono", "JetBrains Mono", monospace',
    displayItalic: true,
    weight: { display: 400, h: 600, body: 400, strong: 600 },
    tracking: { display: '-0.02em', body: '-0.005em', label: '0.14em' },
    googleImports: 'Instrument+Serif:ital@0;1&family=Geist:wght@300..700&family=Geist+Mono:wght@400..600',
  },
  rugged: {
    label: 'Rugged',
    display: '"Big Shoulders Display", "Oswald", sans-serif',
    body: '"Geist", -apple-system, system-ui, sans-serif',
    mono: '"Geist Mono", monospace',
    displayItalic: false,
    weight: { display: 800, h: 700, body: 400, strong: 600 },
    tracking: { display: '-0.01em', body: '-0.005em', label: '0.18em' },
    googleImports: 'Big+Shoulders+Display:wght@500..900&family=Geist:wght@300..700&family=Geist+Mono:wght@400..600',
  },
  modern: {
    label: 'Moderno',
    display: '"Bricolage Grotesque", -apple-system, system-ui, sans-serif',
    body: '"Inter Tight", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace',
    displayItalic: false,
    weight: { display: 600, h: 600, body: 400, strong: 600 },
    tracking: { display: '-0.03em', body: '-0.01em', label: '0.12em' },
    googleImports: 'Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter+Tight:wght@300..700&family=JetBrains+Mono:wght@400..600',
  },
};

// Lago data — 7 lagos & cities on the SMA → VLA → Bariloche corridor
const LAGOS = [
  { id: 'lacar',     name: 'Lácar',     km: 0,   minutes: 0,   note: 'SMA · partida' },
  { id: 'machonico', name: 'Machónico', km: 38,  minutes: 45,  note: '' },
  { id: 'falkner',   name: 'Falkner',   km: 56,  minutes: 70,  note: 'mirador & cascada Vullignanco' },
  { id: 'villarino', name: 'Villarino', km: 60,  minutes: 78,  note: '' },
  { id: 'escondido', name: 'Escondido', km: 62,  minutes: 82,  note: 'parada técnica · café' },
  { id: 'correntoso',name: 'Correntoso',km: 91,  minutes: 130, note: 'río más corto del mundo' },
  { id: 'espejo',    name: 'Espejo',    km: 99,  minutes: 145, note: 'Villa La Angostura' },
];

const ROUTES = [
  { id: 'r1', from: 'SMA', to: 'Bariloche', via: '7 Lagos', dur: '4h 30m', price: 18900, frequency: 'Diaria · 08:30, 14:00' },
  { id: 'r2', from: 'SMA', to: 'Villa La Angostura', via: 'Ruta 40', dur: '2h 30m', price: 9800,  frequency: 'Diaria · 09:00, 16:30' },
  { id: 'r3', from: 'Bariloche', to: 'SMA', via: '7 Lagos', dur: '4h 30m', price: 18900, frequency: 'Diaria · 09:00, 15:30' },
  { id: 'r4', from: 'SMA', to: 'Pucón (CL)', via: 'Paso Mamuil Malal', dur: '5h 15m', price: 32400, frequency: 'Lun · Mié · Vie · 07:00' },
  { id: 'r5', from: 'Bariloche', to: 'Puerto Varas (CL)', via: 'Paso Cardenal Samoré', dur: '7h 00m', price: 38900, frequency: 'Mar · Jue · Sáb · 06:30' },
];

Object.assign(window, { ARAUCANA_LIGHT, ARAUCANA_DARK, TYPE_SYSTEMS, LAGOS, ROUTES });
