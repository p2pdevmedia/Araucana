// icons.jsx — Iconography (line, 1.6 stroke, rounded, andean inspiration)

const Ic = {
  // Navigation
  arrowLeft: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowRight: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronDown: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronRight: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  menu: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  filter: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,

  // Tabs
  compass: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M15.5 8.5L13 13l-4.5 2.5L11 11l4.5-2.5z" fill="currentColor" opacity=".25"/><path d="M15.5 8.5L13 13l-4.5 2.5L11 11l4.5-2.5z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  map: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 4v16M15 6v16" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>,
  ticket: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 000-4V8z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 6v12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2"/></svg>,
  user: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="9" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,

  // Utility
  pin: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 22s7-7 7-12.5a7 7 0 10-14 0C5 15 12 22 12 22z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>,
  pinSolid: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 22s7-7 7-12.5a7 7 0 10-14 0C5 15 12 22 12 22z" fill="currentColor"/><circle cx="12" cy="10" r="2.2" fill="#fff"/></svg>,
  bus: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="4" y="5" width="16" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M4 11h16M9 5v6M15 5v6" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="8" cy="19" r="1.6" fill="currentColor"/><circle cx="16" cy="19" r="1.6" fill="currentColor"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  calendar: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  seat: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M6 4h12v8H6zM5 14h14M7 14v6M17 14v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  passport: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="5" y="3" width="14" height="18" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M9 15h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  globe: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>,
  qr: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M14 14h3v3h-3zM18 14h3M14 18v3M18 18h3v3" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>,
  wifi: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 9c5-5 13-5 18 0M6.5 12.5c3-3 8-3 11 0M10 16c1-1 3-1 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>,
  power: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="4" y="8" width="14" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M18 11h2v2h-2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M7 12h2M11 10v4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M5 13l4 4 10-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.5l6.1-.9L12 3z" fill="currentColor"/></svg>,
  language: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 6h11M8.5 4v2M5 6c1 7 5 9 8 9M11 11c-1 4-4 5-7 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M13 21l4-10 4 10M14.5 17h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mountain: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 19l6-10 4 6 3-4 5 8H3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="9" cy="9" r=".8" fill="currentColor"/></svg>,
  tree: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 3l5 6h-3l4 5h-3l3 4H6l3-4H6l4-5H7l5-6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M12 18v3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  heart: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  share: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M12 3v13M7 8l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  info: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 11v6M12 7.5v.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  flag: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>,
};

// Country flag pills
function FlagAR({ size = 18 }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} style={{ borderRadius: 3, display: 'block' }}>
      <rect width="36" height="24" fill="#74ACDF"/>
      <rect y="8" width="36" height="8" fill="#fff"/>
      <circle cx="18" cy="12" r="2.5" fill="#F6B40E"/>
    </svg>
  );
}
function FlagCL({ size = 18 }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} style={{ borderRadius: 3, display: 'block' }}>
      <rect width="36" height="24" fill="#D52B1E"/>
      <rect width="36" height="12" fill="#fff"/>
      <rect width="12" height="12" fill="#0039A6"/>
      <path d="M6 3l.8 2.4H9.3l-2 1.5.8 2.4L6 7.8l-2 1.5.8-2.4-2-1.5h2.4z" fill="#fff"/>
    </svg>
  );
}

// Logo mark — simplified araucaria
function AraucaniaMark({ size = 40, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
      <ellipse cx="24" cy="24" rx="21" ry="11" transform="rotate(-12 24 24)" stroke={color} strokeWidth="2"/>
      <path d="M24 8v32" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 16h16M14 22h20M16 28h16M19 34h10" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

Object.assign(window, { Ic, FlagAR, FlagCL, AraucaniaMark });
