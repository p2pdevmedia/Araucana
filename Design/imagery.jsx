// imagery.jsx — SVG landscape scenes for the 7 lagos region
// Stylized but realistic-feel, painterly with bands of color

function ImageryDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* Lake hero — Lácar at dawn */}
        <linearGradient id="im-sky-dawn" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F2C8A0"/>
          <stop offset="35%" stopColor="#E8AC8C"/>
          <stop offset="70%" stopColor="#A09BB0"/>
          <stop offset="100%" stopColor="#6B7A8C"/>
        </linearGradient>
        <linearGradient id="im-sky-blue" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7CA8BD"/>
          <stop offset="60%" stopColor="#B8D2DD"/>
          <stop offset="100%" stopColor="#E4ECE8"/>
        </linearGradient>
        <linearGradient id="im-sky-dusk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1A3848"/>
          <stop offset="55%" stopColor="#6B4E5E"/>
          <stop offset="90%" stopColor="#C9633D"/>
          <stop offset="100%" stopColor="#E8A06A"/>
        </linearGradient>
        <linearGradient id="im-lake" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1F5F7F"/>
          <stop offset="100%" stopColor="#0D3B52"/>
        </linearGradient>
        <linearGradient id="im-lake-dawn" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7B8AA0"/>
          <stop offset="100%" stopColor="#2A3F58"/>
        </linearGradient>
        <pattern id="im-grain" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="transparent"/>
          <circle cx="1" cy="1" r=".3" fill="#000" opacity=".05"/>
        </pattern>
      </defs>
    </svg>
  );
}

// Lácar / lake hero — used wide
function SceneLacar({ w = 400, h = 260, mood = 'day' }) {
  const skyId = mood === 'dawn' ? 'im-sky-dawn' : mood === 'dusk' ? 'im-sky-dusk' : 'im-sky-blue';
  const lakeId = mood === 'dawn' ? 'im-lake-dawn' : 'im-lake';
  return (
    <svg viewBox="0 0 400 260" width={w} height={h} preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <rect width="400" height="260" fill={`url(#${skyId})`}/>
      {/* sun/moon */}
      {mood === 'dusk' && <circle cx="305" cy="115" r="22" fill="#F2C896" opacity=".9"/>}
      {mood === 'dawn' && <circle cx="280" cy="95" r="14" fill="#FBE6CC" opacity=".85"/>}
      {/* far mountains */}
      <path d="M0 140 L 35 110 L 70 125 L 110 95 L 150 115 L 195 80 L 240 110 L 290 90 L 340 115 L 400 100 L 400 175 L 0 175 Z"
        fill={mood === 'dusk' ? '#2E3A4F' : '#7E91A3'} opacity={mood === 'dusk' ? .9 : .55}/>
      {/* mid mountains */}
      <path d="M0 165 L 50 130 L 95 155 L 140 120 L 195 150 L 240 130 L 290 150 L 345 125 L 400 145 L 400 200 L 0 200 Z"
        fill={mood === 'dusk' ? '#1E2A3C' : mood === 'dawn' ? '#4F5E70' : '#3E5D6A'}/>
      {/* snow caps */}
      <path d="M138 122 L 142 130 L 146 122 M193 152 L 197 158 L 200 152 M343 127 L 348 134 L 352 127" stroke="#F4F1E6" strokeWidth="2" fill="none"/>
      {/* near forest */}
      <path d="M0 175 L 30 165 L 60 178 L 90 168 L 130 180 L 170 172 L 220 182 L 270 174 L 320 184 L 365 176 L 400 182 L 400 200 L 0 200 Z"
        fill={mood === 'dusk' ? '#0E1A1F' : '#2A4A3A'}/>
      {/* lake */}
      <rect y="195" width="400" height="65" fill={`url(#${lakeId})`}/>
      {/* lake reflection of mountains */}
      <path d="M0 195 L 50 220 L 95 200 L 140 230 L 195 205 L 240 225 L 290 205 L 345 228 L 400 210 L 400 195 Z"
        fill={mood === 'dusk' ? '#1E2A3C' : mood === 'dawn' ? '#4F5E70' : '#3E5D6A'} opacity=".55"/>
      {/* shimmer lines */}
      <g opacity=".4" stroke="#F4F1E6" strokeWidth=".8" fill="none">
        <path d="M20 235 L 60 235"/>
        <path d="M120 245 L 180 245"/>
        <path d="M240 240 L 290 240"/>
        <path d="M320 250 L 370 250"/>
      </g>
      <rect width="400" height="260" fill="url(#im-grain)"/>
    </svg>
  );
}

// Forest / araucaria — for "Cruce a Chile"
function SceneForest({ w = 400, h = 220 }) {
  return (
    <svg viewBox="0 0 400 220" width={w} height={h} preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="forest-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#B8C9C7"/>
          <stop offset="100%" stopColor="#E1DDC4"/>
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#forest-sky)"/>
      <path d="M0 110 L 70 80 L 140 100 L 220 75 L 310 100 L 400 85 L 400 160 L 0 160 Z" fill="#5A6B68" opacity=".8"/>
      <path d="M0 130 L 60 110 L 130 130 L 210 105 L 290 130 L 400 115 L 400 170 L 0 170 Z" fill="#2A4A3A"/>
      {/* araucaria silhouettes */}
      {[40, 95, 165, 235, 305, 365].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${110 + (i % 2) * 12})`}>
          <ellipse cx="0" cy="-2" rx="22" ry="10" fill="#1F3D2E"/>
          <ellipse cx="0" cy="6" rx="28" ry="9" fill="#1F3D2E"/>
          <ellipse cx="0" cy="14" rx="22" ry="8" fill="#1F3D2E"/>
          <rect x="-1.5" y="-6" width="3" height="40" fill="#1F3D2E"/>
        </g>
      ))}
      <rect x="0" y="155" width="400" height="65" fill="#1F3027"/>
      <rect width="400" height="220" fill="url(#im-grain)"/>
    </svg>
  );
}

// Route card thumb — small, sky + 2 peaks + water band
function SceneThumb({ w = 88, h = 88, mood = 'day' }) {
  const sky = mood === 'dawn' ? '#E8AC8C' : mood === 'dusk' ? '#6B4E5E' : '#B8D2DD';
  const mid = mood === 'dusk' ? '#1E2A3C' : '#3E5D6A';
  const lake = mood === 'dawn' ? '#5A6B82' : '#1F5F7F';
  return (
    <svg viewBox="0 0 88 88" width={w} height={h} style={{ display: 'block' }}>
      <rect width="88" height="88" fill={sky}/>
      <path d="M0 56 L 18 40 L 32 50 L 50 35 L 66 48 L 88 38 L 88 62 L 0 62 Z" fill={mid}/>
      <path d="M48 36 L 50 41 L 52 36" stroke="#F4F1E6" strokeWidth="1.5" fill="none"/>
      <rect y="58" width="88" height="30" fill={lake}/>
      <path d="M10 75 L 25 75 M 40 80 L 60 80 M 65 70 L 78 70" stroke="#F4F1E6" strokeWidth=".6" opacity=".5"/>
    </svg>
  );
}

// Bus illustration — vintage adventure bus
function BusIllustration({ w = 280, h = 130, color = '#1F5B4F', accent = '#A05438' }) {
  return (
    <svg viewBox="0 0 280 130" width={w} height={h}>
      {/* body */}
      <path d="M20 80 L 20 50 Q 22 28 50 28 L 230 28 Q 258 28 260 50 L 260 95 L 20 95 Z" fill={color}/>
      {/* roof rack */}
      <rect x="40" y="22" width="200" height="6" rx="2" fill={accent}/>
      <rect x="58" y="14" width="14" height="14" rx="2" fill={accent} opacity=".7"/>
      <rect x="80" y="14" width="20" height="14" rx="2" fill={accent} opacity=".7"/>
      {/* windows */}
      <rect x="30" y="38" width="38" height="26" rx="3" fill="#B8D2DD"/>
      <rect x="74" y="38" width="38" height="26" rx="3" fill="#B8D2DD"/>
      <rect x="118" y="38" width="38" height="26" rx="3" fill="#B8D2DD"/>
      <rect x="162" y="38" width="38" height="26" rx="3" fill="#B8D2DD"/>
      <rect x="206" y="38" width="38" height="26" rx="3" fill="#B8D2DD"/>
      {/* stripe */}
      <rect x="20" y="70" width="240" height="5" fill={accent}/>
      {/* bumper */}
      <rect x="20" y="86" width="240" height="9" fill="#0E2A24"/>
      {/* wheels */}
      <circle cx="62" cy="98" r="14" fill="#1A1F1C"/>
      <circle cx="62" cy="98" r="6" fill="#5F6B5E"/>
      <circle cx="220" cy="98" r="14" fill="#1A1F1C"/>
      <circle cx="220" cy="98" r="6" fill="#5F6B5E"/>
      {/* headlight */}
      <circle cx="252" cy="62" r="4" fill="#F2C896"/>
      {/* door line */}
      <path d="M178 38 L 178 70" stroke="#0E2A24" strokeWidth="1.2"/>
    </svg>
  );
}

// 7 Lagos route map (stylized)
function SevenLakesMap({ w = 360, h = 480, dark = false, activeIdx = -1 }) {
  const land = dark ? '#1B2C27' : '#E6DCC4';
  const water = dark ? '#1B4660' : '#0D3B52';
  const waterAlpha = dark ? '#2D5570' : '#7FA3B3';
  const ink = dark ? '#F1E9D8' : '#1A2522';
  const muted = dark ? '#9AA89C' : '#6B7A6E';
  const accent = '#A05438';
  // 7 lakes laid out roughly north (SMA top) to south (Bariloche bottom)
  const lakes = [
    { x: 180, y: 60,  r: 28, label: 'Lácar',     city: 'San Martín' },
    { x: 145, y: 130, r: 14, label: 'Machónico', city: '' },
    { x: 175, y: 175, r: 22, label: 'Falkner',   city: '' },
    { x: 200, y: 215, r: 12, label: 'Villarino', city: '' },
    { x: 225, y: 245, r: 10, label: 'Escondido', city: '' },
    { x: 180, y: 305, r: 26, label: 'Correntoso',city: '' },
    { x: 235, y: 350, r: 20, label: 'Espejo',    city: 'V. La Angostura' },
  ];
  return (
    <svg viewBox="0 0 360 480" width={w} height={h} style={{ display: 'block' }}>
      {/* topo bg lines */}
      <rect width="360" height="480" fill={land}/>
      <g stroke={ink} strokeWidth=".5" fill="none" opacity={dark ? .12 : .08}>
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <path key={i} d={`M0 ${30 + i*55} Q 90 ${20 + i*55} 180 ${30 + i*55} T 360 ${30 + i*55}`}/>
        ))}
      </g>
      {/* route path */}
      <path d="M 180 60 Q 160 100 145 130 Q 165 160 175 175 Q 195 200 200 215 Q 220 232 225 245 Q 200 280 180 305 Q 215 330 235 350 Q 245 400 230 440"
        stroke={accent} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeDasharray="5 4"/>
      {/* lakes */}
      {lakes.map((l, i) => (
        <g key={l.label}>
          <ellipse cx={l.x} cy={l.y} rx={l.r} ry={l.r * 0.7} fill={i === activeIdx ? waterAlpha : water}/>
          <ellipse cx={l.x} cy={l.y} rx={l.r} ry={l.r * 0.7} fill="none" stroke={ink} strokeWidth=".6" opacity=".25"/>
          {/* shimmer */}
          <path d={`M ${l.x - l.r * 0.5} ${l.y} L ${l.x + l.r * 0.3} ${l.y}`} stroke="#F4F1E6" strokeWidth=".5" opacity=".4"/>
        </g>
      ))}
      {/* stop pins */}
      {lakes.map((l, i) => (
        <g key={`p-${i}`} transform={`translate(${l.x + l.r + 4}, ${l.y - 3})`}>
          <circle cx="0" cy="0" r="3.5" fill={accent}/>
          <circle cx="0" cy="0" r="1.3" fill="#fff"/>
          <text x="8" y="3" fontSize="9" fontFamily="system-ui" fill={ink} fontWeight="600">{l.label}</text>
          {l.city && <text x="8" y="13" fontSize="7.5" fontFamily="system-ui" fill={muted}>{l.city}</text>}
        </g>
      ))}
      {/* compass */}
      <g transform="translate(40, 40)">
        <circle r="14" fill="none" stroke={ink} strokeWidth=".8" opacity=".4"/>
        <path d="M 0 -12 L 3 0 L 0 12 L -3 0 Z" fill={accent}/>
        <text x="0" y="-18" fontSize="7" textAnchor="middle" fill={muted} fontFamily="system-ui">N</text>
      </g>
      {/* scale bar */}
      <g transform="translate(40, 450)">
        <line x1="0" y1="0" x2="60" y2="0" stroke={ink} strokeWidth="1"/>
        <line x1="0" y1="-3" x2="0" y2="3" stroke={ink} strokeWidth="1"/>
        <line x1="30" y1="-2" x2="30" y2="2" stroke={ink} strokeWidth=".8"/>
        <line x1="60" y1="-3" x2="60" y2="3" stroke={ink} strokeWidth="1"/>
        <text x="0" y="14" fontSize="8" fill={muted} fontFamily="system-ui">0</text>
        <text x="55" y="14" fontSize="8" fill={muted} fontFamily="system-ui">25 km</text>
      </g>
    </svg>
  );
}

Object.assign(window, { ImageryDefs, SceneLacar, SceneForest, SceneThumb, BusIllustration, SevenLakesMap });
