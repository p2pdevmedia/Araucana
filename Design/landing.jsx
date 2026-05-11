// landing.jsx — Araucana marketing landing page

function LandingPage({ dark, displayFont, bodyFont }) {
  const t = dark ? ARAUCANA_DARK : ARAUCANA_LIGHT;
  return (
    <div style={{ width: 1280, fontFamily: bodyFont, color: t.ink, background: t.bg, position: 'relative' }}>
      {/* nav */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 56px',
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#FBF6EB' }}>
          <AraucaniaMark size={34} color="#FBF6EB"/>
          <div>
            <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 500, letterSpacing: '.02em', lineHeight: 1 }}>Araucana</div>
            <div style={{ fontSize: 9.5, letterSpacing: '.24em', opacity: .8, marginTop: 2, fontWeight: 600 }}>VIAJES · DESDE 2009</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 36, color: '#FBF6EB', fontSize: 14 }}>
          {['Rutas', '7 Lagos', 'Cruce a Chile', 'Nosotros', 'Soporte'].map(x => <span key={x} style={{ opacity: .9 }}>{x}</span>)}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#FBF6EB', fontSize: 13 }}>
          <span style={{ opacity: .85, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic.globe width="14" height="14"/>ES · EN · DE</span>
          <button style={{ padding: '10px 18px', borderRadius: 999, background: '#FBF6EB', color: t.primaryDeep,
            border: 'none', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>Reservar</button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', height: 760, overflow: 'hidden' }}>
        <SceneLacar w={1280} h={760} mood="dawn"/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.55) 100%)' }}/>
        <div style={{ position: 'absolute', top: 180, left: 56, right: 56, color: '#FBF6EB' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.24em', color: '#F2C896', marginBottom: 22 }}>
            SAN MARTÍN DE LOS ANDES — VILLA LA ANGOSTURA — BARILOCHE
          </div>
          <h1 style={{ fontFamily: displayFont, fontSize: 116, lineHeight: .92, fontWeight: 500, margin: 0,
            letterSpacing: '-.03em', maxWidth: 980, textWrap: 'balance' }}>
            El placer<br/>de viajar por <em style={{ fontStyle: 'italic', color: '#F2C896' }}>la cordillera.</em>
          </h1>
          <div style={{ display: 'flex', gap: 56, marginTop: 36, alignItems: 'flex-end' }}>
            <p style={{ fontSize: 17, lineHeight: 1.5, maxWidth: 460, opacity: .92, textWrap: 'pretty', margin: 0 }}>
              Transporte regular entre las ciudades de la Patagonia andina y cruces internacionales a Chile. Habilitación oficial, guías ES · EN · DE, asientos elegidos.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ padding: '18px 28px', borderRadius: 16, background: '#FBF6EB', color: t.primaryDeep,
                border: 'none', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit' }}>
                Ver rutas y horarios <Ic.arrowRight width="18" height="18"/>
              </button>
              <button style={{ padding: '18px 24px', borderRadius: 16, background: 'rgba(255,255,255,.12)', color: '#FBF6EB',
                border: '1.5px solid rgba(255,255,255,.4)', backdropFilter: 'blur(8px)', fontWeight: 500, fontSize: 15, fontFamily: 'inherit' }}>
                Descargar app
              </button>
            </div>
          </div>
        </div>

        {/* booking dock */}
        <div style={{ position: 'absolute', left: 56, right: 56, bottom: 40, padding: '18px 22px', borderRadius: 22,
          background: 'rgba(251,246,235,.95)', backdropFilter: 'blur(20px) saturate(160%)',
          display: 'flex', alignItems: 'center', gap: 0, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
          {[
            { l: 'Desde', v: 'San Martín de los Andes', i: Ic.pin },
            { l: 'Hacia', v: 'Bariloche', i: Ic.pin },
            { l: 'Fecha', v: 'Mar 12 nov', i: Ic.calendar },
            { l: 'Pasajeros', v: '2 adultos', i: Ic.user },
          ].map((c, i) => (
            <React.Fragment key={i}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px' }}>
                <c.i width="22" height="22" style={{ color: t.primary }}/>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', color: t.inkMuted }}>{c.l.toUpperCase()}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{c.v}</div>
                </div>
              </div>
              {i < 3 && <div style={{ width: 1, height: 38, background: t.line }}/>}
            </React.Fragment>
          ))}
          <button style={{ padding: '18px 28px', borderRadius: 14, background: t.primary, color: '#FBF6EB',
            border: 'none', fontWeight: 600, fontSize: 14, marginLeft: 14, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit' }}>
            <Ic.search width="16" height="16"/>Buscar
          </button>
        </div>
      </section>

      {/* MARQUEE STATS */}
      <section style={{ padding: '64px 56px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 40, borderBottom: `1px solid ${t.line}` }}>
        <div style={{ maxWidth: 380 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.24em', color: t.accent, marginBottom: 14 }}>NUESTRA HISTORIA</div>
          <p style={{ fontFamily: displayFont, fontSize: 28, lineHeight: 1.2, fontWeight: 500, margin: 0, letterSpacing: '-.01em', textWrap: 'balance' }}>
            Somos de San Martín. Hace 16 años conectamos la región con quienes vienen a descubrirla.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 60 }}>
          {[
            { v: '16', l: 'años de operación' },
            { v: '3', l: 'pasos fronterizos' },
            { v: '142410', l: 'legajo · disp. 924/05' },
            { v: 'ES · EN · DE', l: 'a bordo' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: displayFont, fontSize: 56, fontWeight: 500, lineHeight: 1, letterSpacing: '-.02em', color: t.primary }}>{s.v}</div>
              <div style={{ fontSize: 12, color: t.inkMuted, marginTop: 8, letterSpacing: '.05em', fontWeight: 500, maxWidth: 130 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ROUTES */}
      <section style={{ padding: '88px 56px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.24em', color: t.accent, marginBottom: 14 }}>RUTAS REGULARES</div>
            <h2 style={{ fontFamily: displayFont, fontSize: 64, fontWeight: 500, margin: 0, letterSpacing: '-.02em', lineHeight: 1.02, textWrap: 'balance' }}>
              Una <em style={{ fontStyle: 'italic', color: t.accent }}>cordillera</em><br/>de posibilidades.
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
            {['Todas', 'Argentina', 'Chile', '7 Lagos'].map((x, i) => (
              <span key={x} style={{ padding: '10px 16px', borderRadius: 999,
                background: i === 0 ? t.primary : 'transparent', color: i === 0 ? '#FBF6EB' : t.inkSoft,
                border: `1px solid ${i === 0 ? t.primary : t.lineStrong}`, fontWeight: 600 }}>{x}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24 }}>
          {/* big feature */}
          <div style={{ gridRow: 'span 2', borderRadius: 28, overflow: 'hidden', position: 'relative',
            minHeight: 600, boxShadow: '0 24px 60px rgba(14,61,52,.18)' }}>
            <SceneLacar w={620} h={600} mood="day"/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.75) 100%)' }}/>
            <div style={{ position: 'absolute', top: 24, left: 24, padding: '8px 14px', borderRadius: 999,
              background: 'rgba(251,246,235,.95)', color: t.accentDeep, fontSize: 11, fontWeight: 700, letterSpacing: '.14em',
              display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Ic.star width="12" height="12"/>RUTA SIGNATURE
            </div>
            <div style={{ position: 'absolute', bottom: 32, left: 32, right: 32, color: '#FBF6EB' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', opacity: .85 }}>SMA → BARILOCHE</div>
              <div style={{ fontFamily: displayFont, fontSize: 48, fontWeight: 500, marginTop: 10, letterSpacing: '-.02em', lineHeight: 1 }}>
                Camino de los<br/>7 Lagos
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 22, fontSize: 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic.clock width="15" height="15"/>4h 30m</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic.bus width="15" height="15"/>Diaria 08:30 · 14:00</span>
                <span style={{ marginLeft: 'auto', fontFamily: displayFont, fontSize: 28, fontWeight: 500 }}>$18.900</span>
              </div>
            </div>
          </div>

          {ROUTES.slice(1, 5).map((r, i) => (
            <div key={r.id} style={{ borderRadius: 24, overflow: 'hidden', background: t.surface, border: `1px solid ${t.line}`,
              display: 'flex', flexDirection: 'column' }}>
              <SceneThumb w="100%" h={140} mood={['day','dusk','dawn','day'][i]}/>
              <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', color: t.inkMuted, marginBottom: 6 }}>
                  {r.to.includes('CL') ? <><FlagAR size={10}/>→<FlagCL size={10}/></> : <FlagAR size={10}/>} INTERNACIONAL
                </div>
                <div style={{ fontFamily: displayFont, fontSize: 19, fontWeight: 500, letterSpacing: '-.01em', textWrap: 'balance' }}>
                  {r.from} → {r.to}
                </div>
                <div style={{ fontSize: 11.5, color: t.inkMuted, marginTop: 4 }}>{r.via}</div>
                <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 11.5, color: t.inkMuted }}>{r.dur}</span>
                  <span style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 500, color: t.primary }}>${(r.price / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7 LAGOS DETAILED */}
      <section style={{ padding: '88px 56px', background: t.surface, borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.24em', color: t.accent, marginBottom: 14 }}>EL ITINERARIO</div>
            <h2 style={{ fontFamily: displayFont, fontSize: 52, fontWeight: 500, margin: 0, letterSpacing: '-.02em', lineHeight: 1.02 }}>
              Siete espejos<br/>de agua, una ruta.
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.55, color: t.inkSoft, marginTop: 22, textWrap: 'pretty' }}>
              Lácar. Machónico. Falkner. Villarino. Escondido. Correntoso. Espejo. Atravesamos el Parque Nacional Lanín y entramos al Nahuel Huapi por la legendaria Ruta 40 — con paradas estratégicas, café de altura y un guía bilingüe que conoce cada curva.
            </p>
            <button style={{ marginTop: 30, padding: '16px 24px', borderRadius: 14, background: t.primary, color: '#FBF6EB',
              border: 'none', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'inherit' }}>
              Ver itinerario completo <Ic.arrowRight width="16" height="16"/>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {LAGOS.map((l, i) => (
              <div key={l.id} style={{ padding: '18px 18px 20px', borderRadius: 18, background: t.bg, border: `1px solid ${t.line}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: displayFont, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: t.accent }}>0{i+1}</span>
                  <span style={{ fontSize: 10.5, color: t.inkMuted, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>km {l.km}</span>
                </div>
                <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 500, marginTop: 10, letterSpacing: '-.01em' }}>{l.name}</div>
                <div style={{ fontSize: 11, color: t.inkMuted, marginTop: 4, lineHeight: 1.4, minHeight: 30 }}>{l.note || '—'}</div>
              </div>
            ))}
            <div style={{ padding: '18px', borderRadius: 18, background: t.primary, color: '#FBF6EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', opacity: .8 }}>DESTINO</div>
              <div>
                <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 500, letterSpacing: '-.01em' }}>Bariloche</div>
                <div style={{ fontSize: 11, opacity: .8, marginTop: 4 }}>Nahuel Huapi · 4h 30m</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHILE CROSSING */}
      <section style={{ position: 'relative', height: 540, overflow: 'hidden' }}>
        <SceneForest w={1280} h={540}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(11,23,21,.85) 0%, rgba(11,23,21,.5) 50%, rgba(11,23,21,.2) 100%)'}}/>
        <div style={{ position: 'absolute', top: 100, left: 56, right: 56, color: '#FBF6EB', maxWidth: 600 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.24em', color: '#F2C896', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlagAR size={14}/> CRUCE INTERNACIONAL <FlagCL size={14}/>
          </div>
          <h2 style={{ fontFamily: displayFont, fontSize: 72, lineHeight: .98, margin: 0, fontWeight: 500, letterSpacing: '-.02em', textWrap: 'balance' }}>
            Cruzá los Andes<br/>con habilitación.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, opacity: .9, marginTop: 22, maxWidth: 480, textWrap: 'pretty' }}>
            Pasos Mamuil Malal, Hua Hum y Cardenal Samoré. Gestionamos tu PDI, te acompañamos en aduana y conocemos cada parada de Pucón a Puerto Varas.
          </p>
          <div style={{ display: 'flex', gap: 20, marginTop: 36, flexWrap: 'wrap' }}>
            {['Paso Mamuil Malal', 'Paso Hua Hum', 'Paso Cardenal Samoré'].map(p => (
              <div key={p} style={{ padding: '10px 16px', borderRadius: 999, background: 'rgba(255,255,255,.12)',
                backdropFilter: 'blur(8px)', fontSize: 12.5, fontWeight: 500, border: '1px solid rgba(255,255,255,.2)' }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section style={{ padding: '88px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.24em', color: t.accent, marginBottom: 14 }}>EN TU BOLSILLO</div>
          <h2 style={{ fontFamily: displayFont, fontSize: 56, fontWeight: 500, margin: 0, letterSpacing: '-.02em', lineHeight: 1.02 }}>
            Reservá, embarcá,<br/>seguí tu coche.
          </h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.55, color: t.inkSoft, marginTop: 22, maxWidth: 480, textWrap: 'pretty' }}>
            Boleto digital con QR, asiento elegido, seguimiento en vivo del bus, notificaciones de paso fronterizo. Todo en español, inglés o alemán.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
            {['App Store', 'Google Play'].map((s, i) => (
              <div key={s} style={{ padding: '12px 22px', borderRadius: 12, background: t.ink, color: t.bg,
                display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: t.bg, opacity: .2 }}/>
                <div>
                  <div style={{ fontSize: 9.5, opacity: .7, letterSpacing: '.04em' }}>Descargar en</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 36 }}>
            {[
              { i: Ic.qr,     l: 'QR boarding' },
              { i: Ic.pin,    l: 'Tracking en vivo' },
              { i: Ic.passport, l: 'Docs aduana' },
              { i: Ic.language, l: 'Trilingüe' },
            ].map(f => (
              <div key={f.l} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <f.i width="22" height="22" style={{ color: t.primary }}/>
                <span style={{ fontSize: 12, color: t.inkMuted, fontWeight: 500 }}>{f.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 60, left: 60, transform: 'rotate(-8deg)' }}>
            <div style={{ transform: 'scale(.72)', transformOrigin: 'top left' }}>
              <Phone dark={false} w={350} h={720}><div/></Phone>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, transform: 'rotate(6deg)' }}>
            <div style={{ transform: 'scale(.85)', transformOrigin: 'top right' }}>
              <Phone dark={true} w={350} h={720}><div/></Phone>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: t.primaryDeep, color: '#FBF6EB', padding: '64px 56px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 56, paddingBottom: 48,
          borderBottom: '1px solid rgba(251,246,235,.15)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AraucaniaMark size={42} color="#FBF6EB"/>
              <div>
                <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 500 }}>Araucana</div>
                <div style={{ fontSize: 10, letterSpacing: '.2em', opacity: .7, marginTop: 2, fontWeight: 600 }}>VIAJES E.V. Y T.</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, opacity: .8, marginTop: 22, maxWidth: 340 }}>
              San Martín de los Andes, Neuquén, Patagonia Argentina. Expertos en la región hace 16 años.
            </p>
            <div style={{ fontSize: 11, opacity: .6, marginTop: 22, letterSpacing: '.05em' }}>Leg. 14241 · Disp. 924/05</div>
          </div>
          {[
            { t: 'Rutas', l: ['7 Lagos', 'SMA · Bariloche', 'SMA · V. La Angostura', 'Cruce a Chile', 'Ver todas'] },
            { t: 'Empresa', l: ['Nosotros', 'Equipo', 'Choferes', 'Sustentabilidad', 'Trabajá con nosotros'] },
            { t: 'Soporte', l: ['Centro de ayuda', 'Política de cambios', 'Reembolsos', 'Contacto', 'WhatsApp 24/7'] },
          ].map(col => (
            <div key={col.t}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', opacity: .7, marginBottom: 18 }}>{col.t.toUpperCase()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                {col.l.map(x => <span key={x} style={{ opacity: .9 }}>{x}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, fontSize: 12, opacity: .6 }}>
          <span>© 2026 La Araucana Viajes</span>
          <span>ES · EN · DE</span>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { LandingPage });
