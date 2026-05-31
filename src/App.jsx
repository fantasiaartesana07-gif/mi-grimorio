import { useState, useMemo } from 'react'

const CATS = [
  { id: 'hechizos',   label: 'Hechizos',    icon: '✦', color: '#7b4fa6' },
  { id: 'herbologia', label: 'Herbología',   icon: '🜏', color: '#3a7d44' },
  { id: 'astrologia', label: 'Astrología',   icon: '☽', color: '#4a6fa6' },
  { id: 'alquimia',   label: 'Alquimia',     icon: '⚗', color: '#c9a84c' },
  { id: 'entidades',  label: 'Entidades',    icon: '⛧', color: '#8b1a2f' },
  { id: 'runas',      label: 'Runas',        icon: 'ᚠ', color: '#6e6888' },
  { id: 'rituales',   label: 'Rituales',     icon: '◉', color: '#2d6e6e' },
  { id: 'profecias',  label: 'Profecías',    icon: '👁', color: '#7a4a1e' },
]

const SAMPLE = [
  {
    id: '1', title: 'Invocación de la Luna Menguante', category: 'rituales',
    content: 'En la noche del último cuarto, cuando la luna comienza su descenso hacia la oscuridad, se puede invocar su energía para los rituales de liberación y destierro.\n\nIngredientes:\n— Vela negra\n— Sal negra\n— Agua de lluvia\n— Hoja de laurel',
    tags: ['luna', 'destierro'], createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2', title: 'Ajenjo — Artemisia absinthium', category: 'herbologia',
    content: 'Hierba de poder extraordinario, asociada a Diana y la luna. Sus vapores abren la visión astral cuando se quema como incienso.\n\nUsos:\n— Protección en viajes astrales\n— Adivinación y clarividencia\n— Invocación de espíritus',
    tags: ['hierbas', 'visión'], createdAt: '2024-02-03T00:00:00.000Z',
  },
  {
    id: '3', title: 'Mercurio Retrógrado', category: 'astrologia',
    content: 'Cuando Mercurio aparece retrógrado, su influencia sobre las comunicaciones y los viajes se distorsiona.\n\nRemedios:\n— Revisar todo documento antes de firmar\n— Evitar decisiones irrevocables\n— Llevar cornalina para proteger la mente',
    tags: ['mercurio', 'planetas'], createdAt: '2024-03-10T00:00:00.000Z',
  },
]

function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  const set = v => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }
  return [val, set]
}

export default function App() {
  const [entries, setEntries] = useStorage('grimorio_entries', SAMPLE)
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)

  const filtered = useMemo(() => entries
    .filter(e => activeCat === 'all' || e.category === activeCat)
    .filter(e => !search.trim() || e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase()) || e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  , [entries, activeCat, search])

  function handleSave(entry) {
    setEntries(prev => {
      const exists = prev.find(e => e.id === entry.id)
      if (exists) return prev.map(e => e.id === entry.id ? entry : e)
      return [{ ...entry, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...prev]
    })
    setShowNew(false); setSelected(null)
  }

  function handleDelete(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
    setSelected(null)
  }

  const cat = CATS.find(c => c.id === activeCat)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', position: 'relative', zIndex: 1 }}>

      {/* HEADER */}
      <header style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid #2d2660', background: 'linear-gradient(180deg,rgba(13,10,26,0.98),rgba(19,16,42,0.95))', padding: '0.8rem 1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <svg width="32" height="32" viewBox="0 0 100 100" className="animate-float" style={{ flexShrink: 0 }}>
              <circle cx="50" cy="50" r="46" fill="none" stroke="#2d2660" strokeWidth="1"/>
              <polygon points="50,8 61,38 93,38 68,57 78,87 50,68 22,87 32,57 7,38 39,38" fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="50" cy="50" r="3" fill="#c9a84c"/>
            </svg>
            <div>
              <h1 className="font-title animate-flicker" style={{ fontSize: 'clamp(0.85rem,3.5vw,1.1rem)', color: '#c9a84c', lineHeight: 1, letterSpacing: '0.05em' }}>Grimorio</h1>
              <p className="font-heading" style={{ fontSize: '0.55rem', color: '#6e6888', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Biblioteca Arcana</p>
            </div>
          </div>
          <button className="btn btn-gold" onClick={() => setShowNew(true)}>✦ Nueva</button>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6888', fontSize: '0.85rem', pointerEvents: 'none' }}>⌕</span>
          <input type="text" placeholder="Buscar en el grimorio…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem', fontSize: '0.85rem' }}/>
        </div>
      </header>

      {/* LAYOUT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* SIDEBAR OVERLAY */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 20 }}/>}

        {/* SIDEBAR */}
        <nav style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px', background: 'linear-gradient(180deg,rgba(13,10,26,0.98),rgba(19,16,42,0.96))', borderRight: '1px solid #2d2660', zIndex: 30, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: '1rem' }}>
          <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #2d2660' }}>
            <p className="font-heading" style={{ fontSize: '0.6rem', color: '#6e6888', letterSpacing: '0.3em', textTransform: 'uppercase' }}>⊹ Secciones ⊹</p>
          </div>
          {[{ id: 'all', label: 'Todos los escritos', icon: '☰', color: '#c9a84c' }, ...CATS].map(c => (
            <button key={c.id} onClick={() => { setActiveCat(c.id); setSidebarOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 1rem', background: activeCat === c.id ? `rgba(255,255,255,0.05)` : 'transparent', borderLeft: activeCat === c.id ? `2px solid ${c.color}` : '2px solid transparent', borderTop: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', width: '100%' }}>
              <span style={{ fontSize: '1rem', color: activeCat === c.id ? c.color : '#6e6888', minWidth: '20px' }}>{c.icon}</span>
              <span className="font-heading" style={{ fontSize: '0.75rem', color: activeCat === c.id ? '#e8dfc0' : '#b8b0d0', flex: 1, letterSpacing: '0.05em' }}>{c.label}</span>
              {c.id !== 'all' && entries.filter(e => e.category === c.id).length > 0 && (
                <span style={{ fontSize: '0.6rem', color: c.color, fontFamily: 'Cinzel,serif', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem' }}>{entries.filter(e => e.category === c.id).length}</span>
              )}
            </button>
          ))}
          <div style={{ marginTop: 'auto', padding: '1.5rem', textAlign: 'center' }}>
            <svg width="60" height="60" viewBox="0 0 100 100" className="animate-rune-glow" style={{ opacity: 0.3 }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#c9a84c" strokeWidth="1" strokeDasharray="4,4"/>
              <text x="50" y="56" textAnchor="middle" fill="#c9a84c" fontSize="28" fontFamily="serif">☽</text>
            </svg>
          </div>
        </nav>

        {/* MAIN */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.8rem 1rem 0.5rem', borderBottom: '1px solid rgba(45,38,96,0.4)', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: '1px solid #2d2660', color: '#6e6888', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0 }}>☰</button>
            <div style={{ flex: 1 }}>
              <h2 className="font-heading" style={{ fontSize: '0.85rem', color: cat?.color || '#c9a84c', letterSpacing: '0.1em' }}>
                {cat ? `${cat.icon} ${cat.label}` : '☰ Todos los escritos'}
              </h2>
              <p style={{ fontSize: '0.6rem', color: '#6e6888', fontFamily: 'Cinzel,serif' }}>{filtered.length} {filtered.length === 1 ? 'entrada' : 'entradas'}</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: '1rem' }}>
              <svg width="80" height="80" viewBox="0 0 100 100" className="animate-float" style={{ opacity: 0.4 }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#2d2660" strokeWidth="1" strokeDasharray="3,3"/>
                <polygon points="50,15 59,40 86,40 64,56 72,81 50,65 28,81 36,56 14,40 41,40" fill="none" stroke="#7b4fa6" strokeWidth="1.5"/>
              </svg>
              <p className="font-heading" style={{ color: '#6e6888', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                {search ? 'Ningún escrito encontrado' : 'El grimorio está vacío'}
              </p>
              {!search && <button className="btn btn-gold" onClick={() => setShowNew(true)}>✦ Primer Escrito</button>}
            </div>
          ) : (
            <div style={{ padding: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '0.7rem', alignContent: 'start' }}>
              {filtered.map(entry => {
                const c = CATS.find(x => x.id === entry.category)
                return (
                  <div key={entry.id} className="card animate-fade" onClick={() => setSelected(entry)} style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.25s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = c?.color || '#7b4fa6'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2d2660'; e.currentTarget.style.transform = 'translateY(0)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      {c && <span className="badge" style={{ color: c.color, borderColor: c.color, fontSize: '0.55rem' }}>{c.icon} {c.label}</span>}
                      <span style={{ fontSize: '0.6rem', color: '#6e6888', fontFamily: 'Cinzel,serif', marginLeft: '0.5rem', flexShrink: 0 }}>
                        {new Date(entry.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="font-heading" style={{ fontSize: '0.9rem', color: '#e8dfc0', marginBottom: '0.5rem', lineHeight: 1.3 }}>{entry.title}</h3>
                    <p style={{ fontSize: '0.78rem', color: '#6e6888', lineHeight: 1.5, fontStyle: 'italic', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{entry.content.slice(0, 100)}…</p>
                    {entry.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.7rem' }}>
                        {entry.tags.slice(0, 3).map(tag => <span key={tag} style={{ fontSize: '0.6rem', color: '#7b4fa6', background: 'rgba(123,79,166,0.1)', padding: '0.1rem 0.5rem', fontFamily: 'Cinzel,serif' }}>#{tag}</span>)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {(selected || showNew) && <Modal entry={selected} isNew={showNew} onClose={() => { setSelected(null); setShowNew(false) }} onSave={handleSave} onDelete={handleDelete}/>}
    </div>
  )
}

function Modal({ entry, isNew, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(isNew)
  const [form, setForm] = useState({ title: entry?.title || '', category: entry?.category || CATS[0].id, content: entry?.content || '', tags: entry?.tags?.join(', ') || '' })
  const cat = CATS.find(c => c.id === (editing ? form.category : entry?.category))

  function save() {
    if (!form.title.trim()) return
    onSave({ ...entry, title: form.title.trim(), category: form.category, content: form.content, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), updatedAt: new Date().toISOString() })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxHeight: '92dvh', background: 'linear-gradient(180deg,#13102a,#0d0a1a)', border: '1px solid #2d2660', borderBottom: 'none', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.6rem' }}>
          <div style={{ width: '40px', height: '4px', background: '#2d2660', borderRadius: '2px' }}/>
        </div>
        <div style={{ padding: '0 1rem 0.8rem', borderBottom: '1px solid #2d2660', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {cat && <span style={{ fontSize: '1.2rem', color: cat.color }}>{cat.icon}</span>}
          {editing
            ? <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Título del escrito…" className="font-heading" style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid #7b4fa6', color: '#e8dfc0', fontSize: '1rem', padding: '0.2rem 0' }} autoFocus/>
            : <h2 className="font-heading" style={{ flex: 1, fontSize: '1rem', color: '#e8dfc0' }}>{entry?.title}</h2>
          }
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.3rem 0.6rem' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label className="font-heading" style={{ fontSize: '0.65rem', color: '#6e6888', letterSpacing: '0.2em', display: 'block', marginBottom: '0.3rem' }}>CATEGORÍA</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                  {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="font-heading" style={{ fontSize: '0.65rem', color: '#6e6888', letterSpacing: '0.2em', display: 'block', marginBottom: '0.3rem' }}>CONTENIDO</label>
                <textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} placeholder="Escribe tus conocimientos arcanos…" rows={10} style={{ resize: 'vertical', lineHeight: 1.7 }}/>
              </div>
              <div>
                <label className="font-heading" style={{ fontSize: '0.65rem', color: '#6e6888', letterSpacing: '0.2em', display: 'block', marginBottom: '0.3rem' }}>ETIQUETAS (separadas por comas)</label>
                <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="luna, ritual, protección…"/>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {cat && <span className="badge" style={{ color: cat.color, borderColor: cat.color, fontSize: '0.6rem' }}>{cat.icon} {cat.label}</span>}
                <span style={{ fontSize: '0.65rem', color: '#6e6888', fontFamily: 'Cinzel,serif' }}>
                  {new Date(entry?.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ lineHeight: 1.8, fontSize: '0.95rem', color: '#b8b0d0', whiteSpace: 'pre-wrap' }}>{entry?.content}</div>
              {entry?.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  {entry.tags.map(tag => <span key={tag} style={{ fontSize: '0.65rem', color: '#7b4fa6', background: 'rgba(123,79,166,0.12)', padding: '0.2rem 0.6rem', fontFamily: 'Cinzel,serif' }}>#{tag}</span>)}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid #2d2660', display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexShrink: 0, background: 'rgba(13,10,26,0.8)' }}>
          {!isNew && !editing && <button className="btn btn-danger" onClick={() => { if (confirm('¿Borrar este escrito?')) onDelete(entry.id) }}>⌫ Borrar</button>}
          <div style={{ flex: 1 }}/>
          {editing
            ? <><button className="btn btn-ghost" onClick={() => isNew ? onClose() : setEditing(false)}>Cancelar</button><button className="btn btn-gold" onClick={save}>✦ Guardar</button></>
            : <button className="btn btn-gold" onClick={() => setEditing(true)}>✎ Editar</button>
          }
        </div>
      </div>
    </div>
  )
    }
