import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import eventService from '../services/EventService'
import EventCard from '../components/EventCard'

const TABS = [
  { key: 'upcoming', label: 'Upcoming',   icon: '🔜' },
  { key: 'all',      label: 'All Events', icon: '📋' },
]

export default function Events() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('upcoming')
  const [search, setSearch]   = useState('')
  const [sortBy, setSortBy]   = useState('date_asc')

  useEffect(() => {
    setLoading(true)
    const req = tab === 'upcoming' ? eventService.getUpcoming() : eventService.getAll()
    req
      .then(r => setEvents(r.data?.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [tab])

  const now = new Date()
  const filtered = events
    .filter(e =>
      !search.trim() ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date_asc')  return new Date(a.eventDate) - new Date(b.eventDate)
      if (sortBy === 'date_desc') return new Date(b.eventDate) - new Date(a.eventDate)
      if (sortBy === 'title')     return a.title?.localeCompare(b.title)
      return 0
    })

  const upcomingCount = events.filter(e => new Date(e.eventDate) >= now).length

  return (
    <div style={{ fontFamily: "'Nunito','DM Sans',sans-serif", minHeight: '100vh', background: '#fffdf7', color: '#1c1917' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; }

        @keyframes fadeUp    { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-ring{ 0% { transform:scale(0.9); opacity:0.8; } 100% { transform:scale(1.4); opacity:0; } }
        @keyframes shimmer   { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }

        .ev-fade { animation: fadeUp 0.6s ease both; }
        .ev-d1{animation-delay:0.05s} .ev-d2{animation-delay:0.15s} .ev-d3{animation-delay:0.25s}

        .ev-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 100px;
          font-size: 14px; font-weight: 800; border: none; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .ev-tab.active { background: #15803d; color: #fff; box-shadow: 0 4px 14px rgba(21,128,61,0.25); }
        .ev-tab.inactive { background: transparent; color: #78716c; }
        .ev-tab.inactive:hover { background: #f0fdf4; color: #15803d; }

        .ev-search {
          width: 100%; border: 1.5px solid #e7e5e4; border-radius: 14px;
          padding: 11px 40px 11px 40px; font-size: 14px; font-family: inherit;
          font-weight: 600; color: #1c1917; background: #fff; outline: none;
          transition: all 0.2s;
        }
        .ev-search::placeholder { color: #a8a29e; font-weight: 500; }
        .ev-search:focus { border-color: #15803d; box-shadow: 0 0 0 4px rgba(21,128,61,0.08); }

        .ev-select {
          border: 1.5px solid #e7e5e4; border-radius: 100px;
          padding: 8px 16px; font-size: 13px; font-weight: 700;
          font-family: inherit; color: #57534e; background: #fff;
          outline: none; cursor: pointer; transition: border-color 0.2s;
        }
        .ev-select:focus { border-color: #15803d; }

        .ev-section-title {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px;
        }

        .ev-btn-main {
          display: inline-flex; align-items: center; gap: 8px;
          background: #15803d; color: #fff;
          padding: 13px 28px; border-radius: 100px;
          font-size: 14px; font-weight: 800; text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 6px 18px rgba(21,128,61,0.25); transition: all 0.25s; font-family: inherit;
        }
        .ev-btn-main:hover { background: #166534; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(21,128,61,0.35); }

        .ev-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #15803d;
          padding: 12px 28px; border-radius: 100px;
          font-size: 14px; font-weight: 700; text-decoration: none;
          border: 2px solid #bbf7d0; transition: all 0.25s;
        }
        .ev-btn-secondary:hover { border-color: #15803d; background: #f0fdf4; transform: translateY(-2px); }

        .ev-skeleton {
          background: linear-gradient(90deg, #f5f5f4 25%, #ede9e6 50%, #f5f5f4 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 12px;
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: '#1c1917', position: 'relative', overflow: 'hidden', padding: '72px 5% 80px' }}>
        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, opacity:0.07, pointerEvents:'none',
          backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize:'28px 28px' }} />
        {/* Blobs */}
        <div style={{ position:'absolute', top:-80, right:-80, width:360, height:360, background:'radial-gradient(circle,rgba(21,128,61,0.3) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:300, height:300, background:'radial-gradient(circle,rgba(217,119,6,0.2) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:32 }}>
            <div>
              {/* Tag */}
              <div className="ev-fade ev-d1" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:100, padding:'6px 14px', marginBottom:20 }}>
                <span style={{ width:8, height:8, background:'#22c55e', borderRadius:'50%', flexShrink:0, position:'relative', display:'inline-block' }}>
                  <span style={{ position:'absolute', inset:-2, background:'#22c55e', borderRadius:'50%', opacity:0.4, animation:'pulse-ring 1.5s ease-out infinite' }} />
                </span>
                <span style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.7)', letterSpacing:'0.06em' }}>Community Events</span>
              </div>

              <h1 className="ev-fade ev-d2" style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(40px,6vw,72px)', fontWeight:900, letterSpacing:'-0.02em', lineHeight:1.0, color:'#fff', marginBottom:16 }}>
                Cleanliness<br /><span style={{ color:'#4ade80', fontStyle:'italic' }}>Events</span>
              </h1>
              <p className="ev-fade ev-d3" style={{ fontSize:17, lineHeight:1.8, color:'rgba(255,255,255,0.55)', maxWidth:480, fontWeight:400 }}>
                Join community-driven cleanliness drives and make a real difference in your city.
              </p>
            </div>

            {/* Quick stats */}
            <div className="ev-fade ev-d3" style={{ display:'flex', gap:12, flexShrink:0 }}>
              {[
                { n: upcomingCount, l: 'Upcoming', icon: '🔜' },
                { n: events.length, l: 'Total',    icon: '📋' },
              ].map(s => (
                <div key={s.l} style={{ background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'18px 24px', textAlign:'center', backdropFilter:'blur(10px)' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontFamily:'Fraunces,serif', fontSize:32, fontWeight:900, color:'#fff', lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:700, marginTop:4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 5%' }}>

        {/* Toolbar */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:40 }}>

          {/* Tabs + Search */}
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', gap:12 }}>
            {/* Tabs */}
            <div style={{ display:'flex', gap:6, background:'#fff', border:'1.5px solid #f0ede8', borderRadius:100, padding:5 }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSearch('') }}
                  className={`ev-tab ${tab === t.key ? 'active' : 'inactive'}`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  {t.key === 'upcoming' && upcomingCount > 0 && (
                    <span style={{ fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:100, background: tab==='upcoming' ? 'rgba(255,255,255,0.25)' : '#f0fdf4', color: tab==='upcoming' ? '#fff' : '#15803d' }}>
                      {upcomingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position:'relative', width:280 }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, pointerEvents:'none' }}>🔍</span>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search events, location..."
                className="ev-search"
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#a8a29e', fontWeight:800 }}>✕</button>
              )}
            </div>
          </div>

          {/* Count + Sort */}
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:10 }}>
            <p style={{ fontSize:13, color:'#a8a29e', fontWeight:700 }}>
              {loading ? 'Loading...' : (
                <>{filtered.length} event{filtered.length !== 1 ? 's' : ''} found{search && <span style={{ color:'#78716c' }}> · "<b>{search}</b>"</span>}</>
              )}
            </p>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="ev-select">
              <option value="date_asc">📅 Soonest First</option>
              <option value="date_desc">📅 Latest First</option>
              <option value="title">🔤 Title: A → Z</option>
            </select>
          </div>
        </div>

        {/* ── EVENTS GRID ── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'#fff', borderRadius:24, border:'1.5px solid #f0ede8', overflow:'hidden' }}>
                <div className="ev-skeleton" style={{ height:180 }} />
                <div style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
                  <div className="ev-skeleton" style={{ height:16, width:'75%' }} />
                  <div className="ev-skeleton" style={{ height:13, width:'50%' }} />
                  <div className="ev-skeleton" style={{ height:13, width:'65%' }} />
                  <div className="ev-skeleton" style={{ height:40, marginTop:6, borderRadius:100 }} />
                </div>
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:28, border:'1.5px solid #f0ede8', textAlign:'center', padding:'80px 32px' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>{search ? '🔍' : '🗓️'}</div>
            <h3 style={{ fontFamily:'Fraunces,serif', fontSize:26, fontWeight:900, color:'#1c1917', marginBottom:10, letterSpacing:'-0.01em' }}>
              {search ? 'No events found' : tab === 'upcoming' ? 'No upcoming events' : 'No events yet'}
            </h3>
            <p style={{ fontSize:15, color:'#78716c', marginBottom:28, maxWidth:320, margin:'0 auto 28px' }}>
              {search ? `No events match "${search}"` : tab === 'upcoming' ? 'No events scheduled. Check back soon!' : 'Events will appear here once created by admins.'}
            </p>
            {search
              ? <button onClick={() => setSearch('')} className="ev-btn-main">Clear Search</button>
              : tab === 'upcoming' && <button onClick={() => setTab('all')} className="ev-btn-main">View All Events</button>
            }
          </div>

        ) : (
          <>
            {tab === 'all' && !search && (
              <>
                {/* Upcoming */}
                {filtered.filter(e => new Date(e.eventDate) >= now).length > 0 && (
                  <div style={{ marginBottom:40 }}>
                    <div className="ev-section-title">
                      <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:100, padding:'5px 14px' }}>
                        <span style={{ width:8, height:8, background:'#22c55e', borderRadius:'50%' }} />
                        <span style={{ fontFamily:'Fraunces,serif', fontSize:15, fontWeight:900, color:'#15803d' }}>Upcoming</span>
                      </span>
                      <span style={{ fontSize:13, color:'#a8a29e', fontWeight:700 }}>({filtered.filter(e => new Date(e.eventDate) >= now).length})</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
                      {filtered.filter(e => new Date(e.eventDate) >= now).map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                  </div>
                )}

                {/* Past */}
                {filtered.filter(e => new Date(e.eventDate) < now).length > 0 && (
                  <div style={{ opacity:0.75 }}>
                    <div className="ev-section-title">
                      <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f5f5f4', border:'1.5px solid #e7e5e4', borderRadius:100, padding:'5px 14px' }}>
                        <span style={{ width:8, height:8, background:'#a8a29e', borderRadius:'50%' }} />
                        <span style={{ fontFamily:'Fraunces,serif', fontSize:15, fontWeight:900, color:'#78716c' }}>Past Events</span>
                      </span>
                      <span style={{ fontSize:13, color:'#a8a29e', fontWeight:700 }}>({filtered.filter(e => new Date(e.eventDate) < now).length})</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
                      {filtered.filter(e => new Date(e.eventDate) < now).map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                  </div>
                )}
              </>
            )}

            {(tab === 'upcoming' || search) && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
                {filtered.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            )}
          </>
        )}

        {/* ── CTA BANNER ── */}
        {!loading && events.length > 0 && (
          <div style={{ marginTop:64, background:'linear-gradient(135deg,#dcfce7 0%,#d1fae5 50%,#fef9c3 100%)', borderRadius:32, padding:'clamp(40px,5vw,64px)', textAlign:'center', position:'relative', overflow:'hidden', border:'2px solid #bbf7d0' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, background:'rgba(255,255,255,0.4)', borderRadius:'50%', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-50, left:-30, width:240, height:240, background:'rgba(255,255,255,0.3)', borderRadius:'50%', pointerEvents:'none' }} />
            <div style={{ position:'relative' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🤝</div>
              <h3 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(26px,4vw,40px)', fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917', marginBottom:12 }}>
                Want to Organize<br /><span style={{ color:'#15803d', fontStyle:'italic' }}>an Event?</span>
              </h3>
              <p style={{ fontSize:15, color:'#78716c', maxWidth:380, margin:'0 auto 32px', lineHeight:1.75 }}>
                Contact your local admin to create a cleanliness drive in your area.
              </p>
              <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:12 }}>
                <Link to="/complaints/new" className="ev-btn-main">📸 Report an Issue</Link>
                <Link to="/articles" className="ev-btn-secondary">📰 Read Articles</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}