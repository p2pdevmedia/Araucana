// screens-detail.jsx — Route detail, Map, Chile crossing, Checkout, Tickets

// ─────────────────────────────────────────────────────────
// 4. ROUTE DETAIL — Variant A · Cinematic
// ─────────────────────────────────────────────────────────
function RouteDetailCinematic({ dark, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <Phone dark={dark} label="Detalle A · Cinematic">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* hero */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360 }}>
          <SceneLacar w={phoneW} h={360} mood="dawn"/>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, ' + (dark ? '#0B1715' : '#F1E9D8') + ' 100%)'}}/>
        </div>

        <StatusInset dark={dark} transparent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Ic.arrowLeft width="20" height="20"/>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[Ic.share, Ic.heart].map((I, i) => (
                <div key={i} style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(12px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <I width="18" height="18"/>
                </div>
              ))}
            </div>
          </div>
        </StatusInset>

        {/* title strip on hero */}
        <div style={{ position: 'absolute', top: 230, left: 22, right: 22, color: '#FBF6EB' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', color: '#F2C896', marginBottom: 8 }}>RUTA SIGNATURE · 4h 30m</div>
          <h1 style={{ fontFamily: displayFont, fontSize: 34, lineHeight: 1.02, margin: 0, fontWeight: 500, letterSpacing: '-.02em', textWrap: 'balance' }}>
            Camino de<br/>los 7 Lagos
          </h1>
        </div>

        {/* content sheet */}
        <div style={{ position: 'absolute', top: 370, left: 0, right: 0, bottom: 0, padding: '0 22px 140px', overflow: 'hidden' }}>
          {/* meta row */}
          <div style={{ display: 'flex', gap: 0, padding: '14px 0 18px', borderBottom: `1px solid ${t.line}`, alignItems: 'center' }}>
            <Stat label="Distancia" value="99 km" displayFont={displayFont}/>
            <div style={{ width: 1, height: 30, background: t.line, alignSelf: 'center' }}/>
            <Stat label="Paradas" value="7 lagos" displayFont={displayFont}/>
            <div style={{ width: 1, height: 30, background: t.line, alignSelf: 'center' }}/>
            <Stat label="Salidas" value="2 · día" displayFont={displayFont}/>
          </div>

          {/* description */}
          <p style={{ fontSize: 14.5, lineHeight: 1.55, color: t.inkSoft, margin: '16px 0 6px', textWrap: 'pretty' }}>
            Un trazado de leyenda por la Ruta 40 que conecta San Martín con Bariloche, atravesando el Parque Nacional Lanín y Nahuel Huapi. Paradas técnicas, café en Lago Escondido y guía bilingüe a bordo.
          </p>
          <span style={{ fontSize: 13, color: t.primary, fontWeight: 600 }}>Leer más</span>

          {/* timeline preview */}
          <div style={{ marginTop: 22, marginBottom: 18, fontFamily: displayFont, fontSize: 17, fontWeight: 500 }}>Las 7 paradas</div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 2, background: t.lineStrong }}/>
            {LAGOS.slice(0, 4).map((l, i) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0', position: 'relative' }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: t.bg, border: `2px solid ${i === 0 ? t.accent : t.primary}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  {i === 0 && <div style={{ width: 6, height: 6, borderRadius: 3, background: t.accent }}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>Lago {l.name}</div>
                  {l.note && <div style={{ fontSize: 11.5, color: t.inkMuted, marginTop: 1 }}>{l.note}</div>}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: t.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
                  {l.minutes > 0 ? `+${l.minutes}m` : 'Inicio'}
                </div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: t.primary, fontWeight: 600, padding: '6px 0 0 30px' }}>+ 3 paradas más</div>
          </div>
        </div>

        {/* fixed reserve bar */}
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 18, height: 68, borderRadius: 22,
          background: dark ? 'rgba(19,33,30,.92)' : '#1F5B4F', display: 'flex', alignItems: 'center', padding: '0 8px 0 22px',
          boxShadow: dark ? '0 12px 40px rgba(0,0,0,.5)' : '0 12px 30px rgba(14,61,52,.3)' }}>
          <div>
            <div style={{ fontSize: 10.5, color: 'rgba(251,246,235,.7)', fontWeight: 600, letterSpacing: '.08em' }}>DESDE</div>
            <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 500, color: '#FBF6EB', lineHeight: 1 }}>$18.900</div>
          </div>
          <button style={{ marginLeft: 'auto', height: 52, padding: '0 22px', borderRadius: 16, border: 'none',
            background: '#FBF6EB', color: t.primaryDeep, fontSize: 14, fontWeight: 700, letterSpacing: '.01em',
            display: 'flex', alignItems: 'center', gap: 8 }}>
            Reservar asiento <Ic.arrowRight width="16" height="16"/>
          </button>
        </div>
      </div>
    </Phone>
  );
}

function Stat({ label, value, displayFont }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 500, letterSpacing: '-.01em' }}>{value}</div>
      <div style={{ fontSize: 10.5, opacity: .6, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 5. ROUTE DETAIL — Variant B · Map-led timeline
// ─────────────────────────────────────────────────────────
function RouteDetailMap({ dark, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <Phone dark={dark} label="Detalle B · Mapa">
      <IOSNavBar dark={dark} title="" trailingIcon={false}/>
      <div style={{ position: 'absolute', top: 56, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: t.accent }}>SMA → BARILOCHE</div>
          <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 500, marginTop: 4, letterSpacing: '-.01em' }}>7 Lagos</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i <= 5 ? '#F2C896' : t.lineStrong }}/>)}
          <span style={{ fontSize: 11.5, fontWeight: 600, color: t.inkMuted, marginLeft: 4 }}>4.9 · 312</span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, bottom: 100, padding: '0 22px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* map */}
          <div style={{ width: 110, flexShrink: 0, position: 'relative' }}>
            <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${t.line}` }}>
              <SevenLakesMap w={110} h={520} dark={dark} activeIdx={0}/>
            </div>
          </div>
          {/* timeline list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {LAGOS.map((l, i) => (
              <div key={l.id} style={{ padding: '10px 0', borderBottom: i < LAGOS.length - 1 ? `1px solid ${t.line}` : 'none', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: t.accent, letterSpacing: '.08em', minWidth: 14 }}>0{i+1}</span>
                  <span style={{ fontFamily: displayFont, fontSize: 16, fontWeight: 500 }}>{l.name}</span>
                </div>
                <div style={{ fontSize: 10.5, color: t.inkMuted, paddingLeft: 22, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}>
                  {l.km} km · +{l.minutes}m{l.note && ` · ${l.note}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* reserve bar */}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 18, height: 68, borderRadius: 22,
        background: t.primary, display: 'flex', alignItems: 'center', padding: '0 8px 0 22px' }}>
        <div>
          <div style={{ fontSize: 10.5, color: 'rgba(251,246,235,.7)', fontWeight: 600, letterSpacing: '.08em' }}>PRÓXIMA · MAÑ. 08:30</div>
          <div style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 500, color: '#FBF6EB', lineHeight: 1 }}>14 asientos</div>
        </div>
        <button style={{ marginLeft: 'auto', height: 52, padding: '0 22px', borderRadius: 16, border: 'none',
          background: '#FBF6EB', color: t.primaryDeep, fontSize: 14, fontWeight: 700 }}>$18.900 →</button>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────
// 6. MAPA INTERACTIVO regional
// ─────────────────────────────────────────────────────────
function InteractiveMap({ dark, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <Phone dark={dark} label="Mapa">
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <SevenLakesMap w={phoneW} h={phoneH} dark={dark} activeIdx={5}/>
        </div>

        <StatusInset dark={dark} transparent>
          <div style={{ padding: '0 16px' }}>
            <div style={{ height: 46, borderRadius: 23, background: dark ? 'rgba(19,33,30,.88)' : 'rgba(251,246,235,.92)',
              backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)',
              display: 'flex', alignItems: 'center', padding: '0 8px 0 16px', gap: 10, border: `1px solid ${t.line}` }}>
              <Ic.search width="18" height="18" style={{ color: t.inkMuted }}/>
              <span style={{ fontSize: 13.5, color: t.inkSoft, flex: 1 }}>Buscar ruta o ciudad</span>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: t.primary, color: '#FBF6EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ic.filter width="15" height="15"/>
              </div>
            </div>
          </div>
        </StatusInset>

        {/* filter chips floating */}
        <div style={{ position: 'absolute', top: 116, left: 16, right: 16, display: 'flex', gap: 6, overflow: 'hidden' }}>
          {['Argentina', 'Chile', '7 Lagos', 'Lanín'].map((c, i) => (
            <div key={c} style={{
              padding: '7px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
              background: dark ? 'rgba(19,33,30,.88)' : 'rgba(251,246,235,.92)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: i === 2 ? `1.5px solid ${t.primary}` : `1px solid ${t.line}`,
              color: i === 2 ? t.primary : t.inkSoft,
              whiteSpace: 'nowrap',
            }}>{c}</div>
          ))}
        </div>

        {/* zoom + locate */}
        <div style={{ position: 'absolute', right: 16, bottom: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[Ic.plus, null, Ic.pin].map((I, i) => I ? (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 14, background: dark ? 'rgba(19,33,30,.88)' : 'rgba(251,246,235,.95)',
              backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.ink,
              border: `1px solid ${t.line}` }}><I width="18" height="18"/></div>
          ) : (
            <div key={i} style={{ width: 44, height: 1, background: t.line }}/>
          ))}
        </div>

        {/* card peek */}
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 100, borderRadius: 22,
          background: t.bg, padding: '16px 18px', boxShadow: '0 -10px 40px rgba(0,0,0,.15)',
          border: `1px solid ${t.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ borderRadius: 12, overflow: 'hidden' }}>
              <SceneThumb w={56} h={56} mood="dawn"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', color: t.accent }}>LAGO CORRENTOSO</div>
              <div style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 500, marginTop: 2 }}>Río más corto del mundo</div>
              <div style={{ fontSize: 11.5, color: t.inkMuted, marginTop: 2 }}>Parada 06 · km 91</div>
            </div>
            <Ic.chevronRight width="18" height="18" style={{ color: t.inkMuted }}/>
          </div>
        </div>
      </div>
      <TabBar active="map" dark={dark}/>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────
// 7. CRUCE A CHILE — Aduana / docs
// ─────────────────────────────────────────────────────────
function ChileCrossing({ dark, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <Phone dark={dark} label="Cruce a Chile">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }}>
        <SceneForest w={phoneW} h={220}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,0) 60%, ' + (dark ? '#0B1715' : '#F1E9D8') + ' 100%)' }}/>
      </div>
      <StatusInset dark={dark} transparent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
          <div style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(0,0,0,.25)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Ic.arrowLeft width="20" height="20"/>
          </div>
          <div style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,.25)', backdropFilter: 'blur(12px)',
            color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlagAR size={12}/>→<FlagCL size={12}/>
          </div>
        </div>
      </StatusInset>

      <div style={{ position: 'absolute', top: 160, left: 22, right: 22, color: '#FBF6EB' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', color: '#F2C896' }}>PASO MAMUIL MALAL</div>
        <h1 style={{ fontFamily: displayFont, fontSize: 32, fontWeight: 500, lineHeight: 1.02, margin: '6px 0 0', letterSpacing: '-.02em' }}>
          SMA → Pucón
        </h1>
      </div>

      <div style={{ position: 'absolute', top: 250, left: 0, right: 0, bottom: 0, padding: '0 22px 40px', overflow: 'hidden' }}>
        {/* eta + dur */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <InfoCard dark={dark} label="Duración total" value="5h 15m" displayFont={displayFont}/>
          <InfoCard dark={dark} label="Espera aduana" value="~45 min" displayFont={displayFont}/>
        </div>

        <div style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 500, marginBottom: 12 }}>Documentos requeridos</div>
        <div style={{ borderRadius: 18, background: t.surface, border: `1px solid ${t.line}`, overflow: 'hidden' }}>
          {[
            { ok: true,  title: 'DNI / Pasaporte',      sub: 'Vigente · ambos lados escaneados' },
            { ok: true,  title: 'Tarjeta de embarque',  sub: 'Te la generamos al confirmar' },
            { ok: false, title: 'PDI Chile · pre-aviso', sub: 'Completar 24h antes · te asistimos' },
            { ok: false, title: 'Seguro de viaje',      sub: 'Recomendado · podemos cotizarlo' },
          ].map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderTop: i === 0 ? 'none' : `1px solid ${t.line}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: d.ok ? t.primary : t.surface2,
                color: d.ok ? '#FBF6EB' : t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {d.ok ? <Ic.check width="16" height="16"/> : <Ic.plus width="14" height="14"/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d.title}</div>
                <div style={{ fontSize: 11.5, color: t.inkMuted, marginTop: 2 }}>{d.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 16, background: dark ? 'rgba(208,138,98,.12)' : 'rgba(160,84,56,.08)',
          border: `1px solid ${t.accent}33`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Ic.info width="18" height="18" style={{ color: t.accent, marginTop: 1, flexShrink: 0 }}/>
          <div style={{ fontSize: 12.5, color: t.inkSoft, lineHeight: 1.45 }}>
            <strong style={{ color: t.ink }}>Habilitación internacional.</strong> Disp. 924/05 · Leg. 14241. Nuestros choferes y guías están capacitados para acompañarte en aduana.
          </div>
        </div>
      </div>
    </Phone>
  );
}

function InfoCard({ dark, label, value, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <div style={{ flex: 1, padding: '14px 14px', borderRadius: 16, background: t.surface, border: `1px solid ${t.line}` }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: t.inkMuted, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: '-.01em' }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 8. RESERVA / CHECKOUT — Seat selection
// ─────────────────────────────────────────────────────────
function CheckoutSeats({ dark, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  const taken = new Set([2,3,7,11,14,15,22,28]);
  const mine = new Set([16]);
  const rows = 12;
  return (
    <Phone dark={dark} label="Checkout · Asiento">
      <IOSNavBar dark={dark} title="" trailingIcon={false}/>
      <div style={{ position: 'absolute', top: 56, left: 22, right: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: t.accent }}>PASO 2 DE 4 · ASIENTO</div>
        <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 500, marginTop: 4, letterSpacing: '-.01em' }}>Elegí tu lugar</div>
        <div style={{ fontSize: 12.5, color: t.inkMuted, marginTop: 4 }}>SMA → Bariloche · Mar 12 nov · 08:30</div>
      </div>

      {/* bus */}
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0, padding: '0 30px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 240, borderRadius: '60px 60px 22px 22px', padding: '40px 20px 20px', background: t.surface,
          border: `1px solid ${t.line}`, position: 'relative' }}>
          {/* driver */}
          <div style={{ position: 'absolute', top: 14, right: 22, fontSize: 11, color: t.inkMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: t.primary, color: '#FBF6EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ic.user width="13" height="13"/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 8px repeat(0, 1fr)', gap: 8, marginTop: 4 }}>
            {[...Array(rows * 4)].map((_, i) => {
              const row = Math.floor(i / 4);
              const col = i % 4;
              const seatNum = row * 4 + col + 1;
              if (col === 2) return <div key={i} style={{ visibility: 'hidden' }}/>;
              const isTaken = taken.has(seatNum);
              const isMine = mine.has(seatNum);
              return (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: 7,
                  background: isMine ? t.accent : isTaken ? t.surface2 : t.primarySoft,
                  border: isMine ? `2px solid ${t.accentDeep}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isMine ? '#FBF6EB' : isTaken ? t.inkMuted : t.primary,
                  fontSize: 10, fontWeight: 600,
                  opacity: isTaken ? .5 : 1,
                  gridColumn: col === 2 ? 'span 1' : 'auto',
                }}>{isMine ? '✓' : seatNum}</div>
              );
            })}
          </div>
        </div>
      </div>

      {/* legend */}
      <div style={{ position: 'absolute', bottom: 230, left: 22, right: 22, display: 'flex', gap: 14, justifyContent: 'center', fontSize: 11.5 }}>
        {[{ c: t.primarySoft, l: 'Disponible' }, { c: t.accent, l: 'Tu asiento' }, { c: t.surface2, l: 'Ocupado' }].map((x, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.inkSoft }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: x.c }}/>{x.l}
          </div>
        ))}
      </div>

      {/* total bar */}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 18, padding: '14px 18px',
        background: t.surface, borderRadius: 22, border: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.inkMuted, letterSpacing: '.06em' }}>ASIENTO 16 · VENTANILLA</div>
            <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 500, marginTop: 2 }}>$18.900<span style={{ fontSize: 13, color: t.inkMuted, fontWeight: 400, marginLeft: 6 }}>ARS</span></div>
          </div>
          <Ic.seat width="22" height="22" style={{ color: t.primary }}/>
        </div>
        <button style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', background: t.primary,
          color: '#FBF6EB', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          Continuar al pago <Ic.arrowRight width="16" height="16"/>
        </button>
      </div>
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────
// 9. MIS VIAJES — Active ticket + history
// ─────────────────────────────────────────────────────────
function MyTickets({ dark, displayFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <Phone dark={dark} label="Mis viajes">
      <div style={{ padding: '14px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: t.accent }}>MIS VIAJES</div>
          <div style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 500, marginTop: 4, letterSpacing: '-.01em' }}>Próximo viaje</div>
        </div>
      </div>

      {/* active ticket */}
      <div style={{ margin: '14px 18px 24px', borderRadius: 22, overflow: 'hidden', position: 'relative',
        background: t.primary, color: '#FBF6EB', padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 10.5, opacity: .75, letterSpacing: '.12em', fontWeight: 600 }}>MARTES · 12 NOV · 08:30</div>
            <div style={{ fontFamily: displayFont, fontSize: 24, fontWeight: 500, marginTop: 6, letterSpacing: '-.01em' }}>SMA → Bariloche</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>Camino de los 7 Lagos · 4h 30m</div>
          </div>
          <AraucaniaMark size={36} color="rgba(251,246,235,.4)"/>
        </div>

        {/* dashed perforation */}
        <div style={{ position: 'relative', marginLeft: -22, marginRight: -22 }}>
          <div style={{ position: 'absolute', left: -10, top: -6, width: 20, height: 20, borderRadius: 10, background: t.bg }}/>
          <div style={{ position: 'absolute', right: -10, top: -6, width: 20, height: 20, borderRadius: 10, background: t.bg }}/>
          <div style={{ borderTop: '1.5px dashed rgba(251,246,235,.4)', margin: '0 20px' }}/>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
          <div style={{ width: 76, height: 76, background: '#FBF6EB', borderRadius: 12, padding: 8 }}>
            <Ic.qr width="60" height="60" style={{ color: t.primaryDeep }}/>
          </div>
          <div style={{ flex: 1, fontSize: 12 }}>
            <Row label="Asiento" value="16 · ventanilla"/>
            <Row label="Pasajero" value="Camila Vidal"/>
            <Row label="Reserva" value="ARC-2511-A6X"/>
          </div>
        </div>
      </div>

      {/* status */}
      <div style={{ margin: '0 22px 24px', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
        borderRadius: 14, background: dark ? 'rgba(111,207,183,.12)' : 'rgba(31,91,79,.07)',
        border: `1px solid ${t.primary}33` }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: t.primary, boxShadow: `0 0 0 3px ${t.primary}33` }}/>
        <div style={{ fontSize: 12.5, color: t.inkSoft }}>
          <strong style={{ color: t.ink }}>Tu coche sale en 21h.</strong> Te enviaremos el seguimiento 30 min antes.
        </div>
      </div>

      {/* history */}
      <div style={{ padding: '0 22px' }}>
        <div style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 500, marginBottom: 12 }}>Historial</div>
        {[
          { date: '23 OCT', from: 'Bariloche', to: 'SMA', via: '7 Lagos', status: 'Completado' },
          { date: '14 OCT', from: 'SMA', to: 'V. La Angostura', via: 'Ruta 40', status: 'Completado' },
        ].map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
            borderTop: i === 0 ? `1px solid ${t.line}` : `1px solid ${t.line}` }}>
            <div style={{ width: 46, textAlign: 'center' }}>
              <div style={{ fontFamily: displayFont, fontSize: 14, fontWeight: 600 }}>{h.date.split(' ')[0]}</div>
              <div style={{ fontSize: 10, color: t.inkMuted, letterSpacing: '.08em', fontWeight: 600 }}>{h.date.split(' ')[1]}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{h.from} → {h.to}</div>
              <div style={{ fontSize: 11.5, color: t.inkMuted }}>{h.via}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.inkMuted }}>{h.status}</span>
          </div>
        ))}
      </div>
      <TabBar active="tickets" dark={dark}/>
    </Phone>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(251,246,235,.1)' }}>
      <span style={{ opacity: .7 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

Object.assign(window, {
  RouteDetailCinematic, RouteDetailMap, InteractiveMap, ChileCrossing, CheckoutSeats, MyTickets, Stat, InfoCard, Row,
});
