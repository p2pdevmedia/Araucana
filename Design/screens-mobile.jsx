// screens-mobile.jsx — Mobile screens for Araucana app

const phoneW = 390, phoneH = 844;

// ─────────────────────────────────────────────────────────
// Shared scaffolding
// ─────────────────────────────────────────────────────────
function Phone({ children, dark, label, w = phoneW, h = phoneH }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <IOSDevice width={w} height={h} dark={dark}>
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, position: 'relative', overflow: 'hidden' }}>
        <IOSStatusBar dark={dark}/>
        {children}
      </div>
    </IOSDevice>
  );
}

function StatusInset({ children, dark, transparent = false }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: transparent ? 'transparent' : 'inherit' }}>
      <IOSStatusBar dark={dark}/>
      {children}
    </div>
  );
}

function TabBar({ active = 'home', dark }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  const items = [
    { id: 'home', label: 'Explorar', icon: Ic.compass },
    { id: 'map', label: 'Mapa', icon: Ic.map },
    { id: 'tickets', label: 'Mis viajes', icon: Ic.ticket },
    { id: 'profile', label: 'Cuenta', icon: Ic.user },
  ];
  return (
    <div style={{
      position: 'absolute', left: 14, right: 14, bottom: 18,
      height: 64, borderRadius: 28,
      background: dark ? 'rgba(19,33,30,0.78)' : 'rgba(251,246,235,0.82)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      border: `1px solid ${t.line}`,
      boxShadow: dark ? '0 12px 40px rgba(0,0,0,.5)' : '0 12px 30px rgba(14,61,52,.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px',
      zIndex: 10,
    }}>
      {items.map(it => {
        const on = it.id === active;
        const Icon = it.icon;
        return (
          <div key={it.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? t.primary : t.inkMuted, padding: '4px 10px',
          }}>
            <Icon width="22" height="22"/>
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500, letterSpacing: '.01em' }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function LangPill({ dark, code = 'ES' }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px 5px 8px', borderRadius: 999,
      background: dark ? 'rgba(244,237,226,0.08)' : 'rgba(31,91,79,0.08)',
      color: t.ink, fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
    }}>
      <Ic.globe width="13" height="13"/>{code}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 1. ONBOARDING
// ─────────────────────────────────────────────────────────
function OnboardingScreen({ dark, slide = 1, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  const slides = [
    { mood: 'dawn',
      kicker: 'PATAGONIA · 1996',
      title: 'El placer de viajar.',
      sub: 'Conectamos San Martín de los Andes, Villa La Angostura y Bariloche por la ruta de los 7 Lagos. Hace 16 años.' },
    { mood: 'day',
      kicker: 'INTERNACIONAL',
      title: 'Cruzá los Andes a Chile.',
      sub: 'Habilitación internacional. Paso Mamuil Malal, Hua Hum y Cardenal Samoré. Documentación gestionada por nosotros.' },
    { mood: 'dusk',
      kicker: 'TU PRÓXIMO VIAJE',
      title: 'Reservá, embarcá, descubrí.',
      sub: 'Boleto digital, asiento elegido y seguimiento en vivo del coche. Guías ES · EN · DE a bordo.' },
  ];
  const s = slides[slide - 1];
  return (
    <Phone dark={dark} label="Onboarding">
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 520 }}>
          <SceneLacar w={phoneW} h={520} mood={s.mood}/>
          <div style={{ position: 'absolute', inset: 0, background: dark
            ? 'linear-gradient(180deg, rgba(11,23,21,0) 30%, rgba(11,23,21,.85) 75%, rgba(11,23,21,1) 100%)'
            : 'linear-gradient(180deg, rgba(241,233,216,0) 30%, rgba(241,233,216,.9) 75%, rgba(241,233,216,1) 100%)'}}/>
        </div>
      </div>
      <StatusInset dark={dark} transparent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px 0', marginTop: -6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: dark ? '#fff' : '#fff' }}>
            <AraucaniaMark size={26} color="#fff"/>
            <span style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 500, color: '#fff', letterSpacing: '.02em' }}>Araucana</span>
          </div>
          <span style={{ fontSize: 12, color: '#fff', opacity: .8 }}>Saltar</span>
        </div>
      </StatusInset>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 28px 44px', color: t.ink }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', color: t.accent, marginBottom: 14 }}>{s.kicker}</div>
        <h1 style={{ fontFamily: displayFont, fontSize: 40, lineHeight: 1.02, fontWeight: 500, margin: 0, letterSpacing: '-.02em', textWrap: 'balance' }}>
          {s.title}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.45, color: t.inkSoft, marginTop: 16, marginBottom: 26, textWrap: 'pretty' }}>{s.sub}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {[1,2,3].map(i => <div key={i} style={{ width: i === slide ? 22 : 6, height: 6, borderRadius: 3, background: i === slide ? t.primary : t.lineStrong, transition: 'width .25s' }}/>)}
        </div>
        <button style={{
          width: '100%', height: 56, borderRadius: 18, border: 'none',
          background: t.primary, color: '#FBF6EB',
          fontFamily: 'inherit', fontSize: 15, fontWeight: 600, letterSpacing: '.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          {slide === 3 ? 'Empezar' : 'Continuar'} <Ic.arrowRight width="18" height="18"/>
        </button>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: t.inkMuted }}>
          ES · EN · DE · ya hablamos tu idioma
        </div>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────
// 2. HOME — Variant A · Editorial card stack
// ─────────────────────────────────────────────────────────
function HomeEditorial({ dark, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  const featured = ROUTES[0];
  return (
    <Phone dark={dark} label="Home A · Editorial">
      <div style={{ paddingTop: 8, paddingBottom: 100, height: '100%', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ padding: '8px 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: t.inkMuted, fontWeight: 500 }}>Mar · 12 nov</div>
            <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 500, marginTop: 1, letterSpacing: '-.01em' }}>Buen día, Camila</div>
          </div>
          <LangPill dark={dark} code="ES"/>
        </div>

        {/* search */}
        <div style={{ margin: '0 20px 22px', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 16,
          background: dark ? t.surface : t.surface, border: `1px solid ${t.line}` }}>
          <Ic.search width="18" height="18" style={{ color: t.inkMuted }}/>
          <span style={{ fontSize: 14, color: t.inkMuted, flex: 1 }}>¿A dónde vamos?</span>
          <Ic.filter width="18" height="18" style={{ color: t.primary }}/>
        </div>

        {/* featured hero card */}
        <div style={{ margin: '0 20px 24px', borderRadius: 24, overflow: 'hidden', position: 'relative',
          boxShadow: dark ? '0 14px 36px rgba(0,0,0,.4)' : '0 14px 36px rgba(14,61,52,.16)' }}>
          <SceneLacar w={phoneW - 40} h={260} mood="dawn"/>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.7) 100%)' }}/>
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px',
            background: 'rgba(255,255,255,.92)', borderRadius: 999, fontSize: 10.5, fontWeight: 700, color: '#A05438', letterSpacing: '.1em' }}>
            <Ic.star width="11" height="11"/>RUTA SIGNATURE
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18, color: '#FBF6EB' }}>
            <div style={{ fontSize: 11, opacity: .85, letterSpacing: '.14em', fontWeight: 600 }}>SMA → BARILOCHE</div>
            <div style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 500, lineHeight: 1.05, marginTop: 4, letterSpacing: '-.01em' }}>
              Camino de los 7 Lagos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, fontSize: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic.clock width="13" height="13"/>4h 30m</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic.bus width="13" height="13"/>Diaria</span>
              <span style={{ marginLeft: 'auto', fontFamily: displayFont, fontSize: 20, fontWeight: 500 }}>$18.900</span>
            </div>
          </div>
        </div>

        {/* chips */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8, overflow: 'hidden' }}>
          {['Todos', 'Argentina', 'Chile', 'Fin de semana'].map((c, i) => (
            <div key={c} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
              background: i === 0 ? t.primary : 'transparent',
              color: i === 0 ? '#FBF6EB' : t.inkSoft,
              border: `1px solid ${i === 0 ? t.primary : t.lineStrong}`,
              whiteSpace: 'nowrap',
            }}>{c}</div>
          ))}
        </div>

        {/* list */}
        <div style={{ padding: '4px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 500 }}>Próximas salidas</div>
            <span style={{ fontSize: 12, color: t.primary, fontWeight: 600 }}>Ver todas</span>
          </div>
          {ROUTES.slice(1, 4).map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${t.line}` }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <SceneThumb w={62} h={62} mood={i === 1 ? 'dusk' : i === 2 ? 'dawn' : 'day'}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{r.from} → {r.to}</div>
                <div style={{ fontSize: 11.5, color: t.inkMuted }}>{r.via} · {r.dur}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 500 }}>${(r.price / 1000).toFixed(1)}k</div>
                <div style={{ fontSize: 10, color: t.inkMuted }}>desde</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="home" dark={dark}/>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────
// 3. HOME — Variant B · Map-first
// ─────────────────────────────────────────────────────────
function HomeMapFirst({ dark, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <Phone dark={dark} label="Home B · Map-first">
      <div style={{ position: 'absolute', inset: 0, paddingTop: 0 }}>
        {/* map fills top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 470 }}>
          <SevenLakesMap w={phoneW} h={470} dark={dark} activeIdx={0}/>
          <div style={{ position: 'absolute', inset: 0, background: dark
            ? 'linear-gradient(180deg, rgba(11,23,21,.5) 0%, rgba(11,23,21,0) 18%, rgba(11,23,21,0) 80%, rgba(11,23,21,1) 100%)'
            : 'linear-gradient(180deg, rgba(241,233,216,.6) 0%, rgba(241,233,216,0) 18%, rgba(241,233,216,0) 80%, rgba(241,233,216,1) 100%)' }}/>
        </div>

        <StatusInset dark={dark} transparent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: dark ? 'rgba(19,33,30,.85)' : 'rgba(251,246,235,.85)',
                backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.ink }}>
                <Ic.menu width="20" height="20"/>
              </div>
            </div>
            <div style={{ padding: '6px 10px', borderRadius: 999, background: dark ? 'rgba(19,33,30,.85)' : 'rgba(251,246,235,.85)',
              backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }}>
              <FlagAR size={12}/>AR <span style={{ opacity: .4 }}>·</span> <FlagCL size={12}/>CL
            </div>
          </div>
        </StatusInset>

        {/* bottom sheet */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 380,
          background: t.bg, borderRadius: '28px 28px 0 0',
          padding: '10px 22px 100px',
          boxShadow: '0 -20px 50px rgba(0,0,0,.1)' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: t.lineStrong, margin: '4px auto 16px' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', color: t.accent }}>RUTA ACTIVA</div>
              <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 500, marginTop: 4, letterSpacing: '-.01em' }}>
                Camino de los 7 Lagos
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <Chip dark={dark} icon={Ic.clock}>4h 30m</Chip>
            <Chip dark={dark} icon={Ic.bus}>Diaria · 08:30, 14:00</Chip>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, height: 52, borderRadius: 16, border: `1.5px solid ${t.primary}`,
              background: 'transparent', color: t.primary, fontSize: 14, fontWeight: 600 }}>Ver detalle</button>
            <button style={{ flex: 1.4, height: 52, borderRadius: 16, border: 'none',
              background: t.primary, color: '#FBF6EB', fontSize: 14, fontWeight: 600 }}>Reservar — $18.900</button>
          </div>
        </div>
      </div>
      <TabBar active="map" dark={dark}/>
    </Phone>
  );
}

function Chip({ dark, icon: Icon, children }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999,
      background: dark ? 'rgba(244,237,226,.06)' : 'rgba(31,91,79,.07)', fontSize: 12, fontWeight: 500, color: t.inkSoft }}>
      {Icon && <Icon width="13" height="13"/>}
      {children}
    </div>
  );
}

Object.assign(window, { Phone, StatusInset, TabBar, LangPill, Chip, OnboardingScreen, HomeEditorial, HomeMapFirst, phoneW, phoneH });
