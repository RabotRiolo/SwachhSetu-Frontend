import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, userIsAdmin } from '../contexts/AuthContext'
import complaintService from '../services/ComplaintService'
import ComplaintCard from '../components/ComplaintCard'
import StatusBadge from '../components/StatusBridge'

const FILTERS = ['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']

const FILTER_CONFIG = {
  ALL:         { label: 'All',         icon: '📋', hex: '#57534e',  activeBg: '#1c1917' },
  PENDING:     { label: 'Pending',     icon: '⏳', hex: '#d97706',  activeBg: '#d97706' },
  ASSIGNED:    { label: 'Assigned',    icon: '👥', hex: '#2563eb',  activeBg: '#2563eb' },
  IN_PROGRESS: { label: 'In Progress', icon: '🔧', hex: '#ea580c',  activeBg: '#ea580c' },
  RESOLVED:    { label: 'Resolved',    icon: '✅', hex: '#15803d',  activeBg: '#15803d' },
}

const BAR_COLORS = {
  pending:    '#fbbf24',
  assigned:   '#60a5fa',
  inProgress: '#fb923c',
  resolved:   '#15803d',
}

export default function Dashboard() {
  const { user } = useAuth()

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('ALL')
  const [search, setSearch]         = useState('')
  const [view, setView]             = useState('grid')
  const [sortBy, setSortBy]         = useState('newest')
  const [greeting, setGreeting]     = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  const fetchComplaints = useCallback(() => {
    setLoading(true)
    complaintService.getMine()
      .then(r => setComplaints(r.data?.data || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  const counts = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === 'PENDING').length,
    assigned:   complaints.filter(c => c.status === 'ASSIGNED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved:   complaints.filter(c => c.status === 'RESOLVED').length,
  }
  const resolutionRate = counts.total > 0 ? Math.round((counts.resolved / counts.total) * 100) : 0

  const filtered = complaints
    .filter(c => filter === 'ALL' || c.status === filter)
    .filter(c => !search.trim() || c.area?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'status') {
        const order = { PENDING:0, ASSIGNED:1, IN_PROGRESS:2, RESOLVED:3 }
        return (order[a.status]??9) - (order[b.status]??9)
      }
      return 0
    })

  const firstName = user?.name?.split(' ')[0]

  const isAdmin = userIsAdmin(user)

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", minHeight:'100vh', background:'#fffdf7', color:'#1c1917' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing:border-box; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring{ 0%{transform:scale(0.9);opacity:0.8} 100%{transform:scale(1.4);opacity:0} }
        @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

        .db-fade{animation:fadeUp 0.6s ease both}
        .db-d1{animation-delay:0.05s} .db-d2{animation-delay:0.15s} .db-d3{animation-delay:0.25s}

        .db-stat-tile {
          background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.12);
          border-radius:20px; padding:16px 12px; text-align:center;
          cursor:pointer; transition:all 0.2s; backdrop-filter:blur(8px);
        }
        .db-stat-tile:hover { background:rgba(255,255,255,0.16); transform:translateY(-2px); }
        .db-stat-tile.active { background:rgba(255,255,255,0.2); border-color:rgba(255,255,255,0.4); }

        .db-filter-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:8px 16px; border-radius:100px;
          font-size:13px; font-weight:800; border:1.5px solid #e7e5e4;
          cursor:pointer; transition:all 0.2s; font-family:inherit;
          background:#fff; color:#78716c;
        }
        .db-filter-btn:hover { border-color:#bbf7d0; background:#f0fdf4; color:#15803d; }
        .db-filter-btn.active { border-color:transparent; color:#fff; }

        .db-search {
          width:100%; border:1.5px solid #e7e5e4; border-radius:14px;
          padding:11px 38px 11px 40px; font-size:14px; font-family:inherit;
          font-weight:600; color:#1c1917; background:#fff; outline:none; transition:all 0.2s;
        }
        .db-search::placeholder{color:#a8a29e;font-weight:500}
        .db-search:focus{border-color:#15803d;box-shadow:0 0 0 4px rgba(21,128,61,0.08)}

        .db-select {
          border:1.5px solid #e7e5e4; border-radius:100px;
          padding:9px 16px; font-size:13px; font-weight:700;
          font-family:inherit; color:#57534e; background:#fff;
          outline:none; cursor:pointer;
        }
        .db-select:focus{border-color:#15803d}

        .db-view-btn {
          padding:9px 14px; font-size:14px; font-weight:800;
          border:none; cursor:pointer; transition:all 0.2s; font-family:inherit;
        }
        .db-view-btn.active{background:#15803d;color:#fff}
        .db-view-btn.inactive{background:transparent;color:#a8a29e}
        .db-view-btn.inactive:hover{background:#f0fdf4;color:#15803d}

        .db-card {
          background:#fff; border-radius:24px; border:1.5px solid #f0ede8;
          transition:all 0.3s; box-shadow:0 2px 12px rgba(0,0,0,0.03);
        }
        .db-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,0.08)}

        .db-list-row {
          display:flex; align-items:center; gap:14px;
          padding:14px 20px; text-decoration:none; color:inherit;
          border-bottom:1.5px solid #f0ede8; transition:background 0.15s;
        }
        .db-list-row:last-child{border-bottom:none}
        .db-list-row:hover{background:#fafaf8}

        .db-skeleton {
          background:linear-gradient(90deg,#f5f5f4 25%,#ede9e6 50%,#f5f5f4 75%);
          background-size:400px 100%; animation:shimmer 1.4s ease infinite; border-radius:12px;
        }

        .db-quick-link {
          display:flex; align-items:center; gap:14px;
          padding:20px; border-radius:20px; border:1.5px solid #f0ede8;
          background:#fff; text-decoration:none; color:inherit;
          transition:all 0.25s;
        }
        .db-quick-link:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.07);border-color:#bbf7d0}

        .db-btn-main {
          display:inline-flex;align-items:center;gap:8px;
          background:#15803d;color:#fff;padding:13px 28px;border-radius:100px;
          font-size:14px;font-weight:800;text-decoration:none;border:none;cursor:pointer;
          box-shadow:0 6px 18px rgba(21,128,61,0.25);transition:all 0.25s;font-family:inherit;
        }
        .db-btn-main:hover{background:#166534;transform:translateY(-2px);box-shadow:0 10px 28px rgba(21,128,61,0.35)}

        /* Home button — ghost style on dark banner */
        .db-btn-home {
          display:inline-flex;align-items:center;gap:8px;
          background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.75);
          padding:13px 22px;border-radius:100px;
          font-size:14px;font-weight:800;text-decoration:none;
          border:1.5px solid rgba(255,255,255,0.18);
          transition:all 0.25s;font-family:inherit;
        }
        .db-btn-home:hover{background:rgba(255,255,255,0.16);border-color:rgba(255,255,255,0.35);color:#fff;transform:translateY(-2px);}

        /* Admin button — amber accent, stands out without clashing */
        .db-btn-admin {
          display:inline-flex;align-items:center;gap:8px;
          background:rgba(251,191,36,0.15);color:#fbbf24;
          padding:13px 22px;border-radius:100px;
          font-size:14px;font-weight:800;text-decoration:none;
          border:1.5px solid rgba(251,191,36,0.35);
          transition:all 0.25s;font-family:inherit;
        }
        .db-btn-admin:hover{background:rgba(251,191,36,0.25);border-color:#fbbf24;color:#fef3c7;transform:translateY(-2px);}
      `}</style>

      {/* ── HERO BANNER ── */}
      <section style={{ background:'#1c1917', position:'relative', overflow:'hidden', padding:'56px 5% 64px' }}>
        {/* Dot grid */}
        <div style={{ position:'absolute',inset:0,opacity:0.07,pointerEvents:'none',
          backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',
          backgroundSize:'28px 28px' }} />
        {/* Blobs */}
        <div style={{ position:'absolute',top:-80,right:-80,width:360,height:360,background:'radial-gradient(circle,rgba(21,128,61,0.3) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-60,left:-60,width:300,height:300,background:'radial-gradient(circle,rgba(217,119,6,0.2) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />

        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:24 }}>

            {/* Left: greeting + title */}
            <div>
              <div className="db-fade db-d1" style={{ display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.08)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:100,padding:'6px 14px',marginBottom:16 }}>
                <span style={{ width:8,height:8,background:'#22c55e',borderRadius:'50%',flexShrink:0,position:'relative',display:'inline-block' }}>
                  <span style={{ position:'absolute',inset:-2,background:'#22c55e',borderRadius:'50%',opacity:0.4,animation:'pulse-ring 1.5s ease-out infinite' }} />
                </span>
                <span style={{ fontSize:12,fontWeight:800,color:'rgba(255,255,255,0.65)',letterSpacing:'0.06em' }}>{greeting}, {firstName} 👋</span>
              </div>

              <h1 className="db-fade db-d2" style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(36px,5vw,60px)', fontWeight:900, letterSpacing:'-0.02em', lineHeight:1.05, color:'#fff', marginBottom:10 }}>
                {firstName}<br /><span style={{ color:'#4ade80', fontStyle:'italic' }}>Dashboard</span>
              </h1>
              <p className="db-fade db-d3" style={{ fontSize:15, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>
                Track and manage your cleanliness reports
              </p>
            </div>

            {/* Right: action buttons */}
            <div className="db-fade db-d2" style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10, flexShrink:0, marginTop:8 }}>

              {/* Home button — always visible */}
              <Link to="/" className="db-btn-home">
                <span>🏠</span> Home
              </Link>

              {/* Admin button — only for admin users */}
              {isAdmin && (
                <Link to="/admin" className="db-btn-admin">
                  <span>⚙️</span> Admin Panel
                </Link>
              )}

              {/* Raise complaint — primary CTA */}
              <Link to="/complaints/new" className="db-btn-main" style={{ fontSize:15, padding:'14px 28px' }}>
                <span>📸</span> Raise a Complaint
              </Link>

            </div>
          </div>

          {/* ── Stat tiles ── */}
          <div className="db-fade db-d3" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginTop:36 }}>
            {[
              { key:'ALL',         label:'Total',       value:counts.total,      icon:'📋' },
              { key:'PENDING',     label:'Pending',     value:counts.pending,    icon:'⏳' },
              { key:'ASSIGNED',    label:'Assigned',    value:counts.assigned,   icon:'👥' },
              { key:'IN_PROGRESS', label:'In Progress', value:counts.inProgress, icon:'🔧' },
              { key:'RESOLVED',    label:'Resolved',    value:counts.resolved,   icon:'✅' },
            ].map(s => (
              <button key={s.key} onClick={() => setFilter(s.key)}
                className={`db-stat-tile ${filter===s.key?'active':''}`}>
                <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:900, color:'#fff', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700, marginTop:4 }}>{s.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 5%' }}>

        {/* ── Progress card ── */}
        {counts.total > 0 && (
          <div style={{ background:'#fff', borderRadius:24, border:'1.5px solid #f0ede8', padding:'24px 28px', marginBottom:28, boxShadow:'0 2px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <p style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:900, letterSpacing:'-0.01em', color:'#1c1917', marginBottom:4 }}>Overall Progress</p>
                <p style={{ fontSize:13, color:'#a8a29e', fontWeight:600 }}>{counts.resolved} of {counts.total} complaints resolved</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:36, fontWeight:900, color:'#15803d', lineHeight:1 }}>{resolutionRate}%</div>
                <div style={{ fontSize:11, color:'#a8a29e', fontWeight:700, marginTop:2 }}>resolved</div>
              </div>
            </div>

            {/* Stacked bar */}
            <div style={{ height:8, borderRadius:100, background:'#f0ede8', overflow:'hidden', display:'flex', marginBottom:14 }}>
              {[
                { value:counts.pending,    color:BAR_COLORS.pending    },
                { value:counts.assigned,   color:BAR_COLORS.assigned   },
                { value:counts.inProgress, color:BAR_COLORS.inProgress },
                { value:counts.resolved,   color:BAR_COLORS.resolved   },
              ].map((bar,i) => {
                const pct = (bar.value / counts.total) * 100
                return pct > 0 ? (
                  <div key={i} style={{ width:`${pct}%`, height:'100%', background:bar.color, transition:'width 0.5s ease' }} />
                ) : null
              })}
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
              {[
                { color:BAR_COLORS.pending,    label:'Pending',     value:counts.pending    },
                { color:BAR_COLORS.assigned,   label:'Assigned',    value:counts.assigned   },
                { color:BAR_COLORS.inProgress, label:'In Progress', value:counts.inProgress },
                { color:BAR_COLORS.resolved,   label:'Resolved',    value:counts.resolved   },
              ].map(l => (
                <span key={l.label} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'#78716c', fontWeight:700 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:l.color, flexShrink:0 }} />
                  {l.label}: {l.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {FILTERS.map(f => {
              const cfg   = FILTER_CONFIG[f]
              const count = f==='ALL' ? counts.total : counts[f==='IN_PROGRESS'?'inProgress':f.toLowerCase()]
              const isActive = filter === f
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={`db-filter-btn ${isActive?'active':''}`}
                  style={ isActive ? { background:cfg.activeBg, borderColor:cfg.activeBg } : {} }
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                  <span style={{ fontSize:11, fontWeight:800, padding:'2px 7px', borderRadius:100,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#f5f5f4',
                    color: isActive ? '#fff' : '#a8a29e' }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            <div style={{ position:'relative', flex:1, minWidth:200 }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, pointerEvents:'none' }}>🔍</span>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search by area name..." className="db-search" />
              {search && (
                <button onClick={()=>setSearch('')} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#a8a29e',fontWeight:800 }}>✕</button>
              )}
            </div>

            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="db-select">
              <option value="newest">🕐 Newest First</option>
              <option value="oldest">🕐 Oldest First</option>
              <option value="status">📊 By Status</option>
            </select>

            <div style={{ display:'flex', background:'#fff', border:'1.5px solid #e7e5e4', borderRadius:14, overflow:'hidden' }}>
              {[{v:'grid',icon:'⊞'},{v:'list',icon:'☰'}].map(btn => (
                <button key={btn.v} onClick={()=>setView(btn.v)}
                  className={`db-view-btn ${view===btn.v?'active':'inactive'}`}
                  title={`${btn.v} view`}
                >{btn.icon}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Result count */}
        {!loading && complaints.length > 0 && (
          <p style={{ fontSize:13, color:'#a8a29e', fontWeight:700, marginBottom:20 }}>
            Showing {filtered.length} of {counts.total} complaint{counts.total!==1?'s':''}
            {filter!=='ALL' && <span style={{ color:'#78716c' }}> · {FILTER_CONFIG[filter].label}</span>}
            {search && <span style={{ color:'#78716c' }}> · "{search}"</span>}
          </p>
        )}

        {/* ── CONTENT ── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns: view==='grid' ? 'repeat(auto-fill,minmax(300px,1fr))' : '1fr', gap: view==='grid'?20:10 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'#fff', borderRadius:24, border:'1.5px solid #f0ede8',
                height: view==='grid' ? 280 : 72,
                display: view==='list' ? 'flex' : 'block',
                alignItems:'center', gap:14, padding: view==='list'?'0 20px':0,
                overflow:'hidden' }}>
                {view==='list' ? (
                  <>
                    <div className="db-skeleton" style={{ width:44,height:44,borderRadius:12,flexShrink:0 }} />
                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                      <div className="db-skeleton" style={{ height:13,width:'45%' }} />
                      <div className="db-skeleton" style={{ height:11,width:'25%' }} />
                    </div>
                    <div className="db-skeleton" style={{ width:72,height:24,borderRadius:100 }} />
                  </>
                ) : null}
              </div>
            ))}
          </div>

        ) : complaints.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:28, border:'1.5px solid #f0ede8', textAlign:'center', padding:'80px 32px' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>📝</div>
            <h3 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917', marginBottom:10 }}>No complaints yet</h3>
            <p style={{ fontSize:15, color:'#78716c', maxWidth:340, margin:'0 auto 28px', lineHeight:1.75 }}>
              Report a dirty area near you. AI will instantly generate a cleaning plan!
            </p>
            <Link to="/complaints/new" className="db-btn-main">
              <span>📸</span> Raise Your First Complaint
            </Link>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:28, border:'1.5px solid #f0ede8', textAlign:'center', padding:'60px 32px' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🔍</div>
            <h3 style={{ fontFamily:'Fraunces,serif', fontSize:22, fontWeight:900, color:'#1c1917', marginBottom:8 }}>No complaints found</h3>
            <p style={{ fontSize:14, color:'#78716c', marginBottom:24 }}>
              {search ? `No results for "${search}"` : `No complaints with status "${FILTER_CONFIG[filter].label}"`}
            </p>
            <button onClick={()=>{setFilter('ALL');setSearch('')}} className="db-btn-main">Clear Filters</button>
          </div>

        ) : view === 'grid' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {filtered.map(c => <ComplaintCard key={c.id} complaint={c} />)}
          </div>

        ) : (
          <div style={{ background:'#fff', borderRadius:24, border:'1.5px solid #f0ede8', overflow:'hidden' }}>
            {filtered.map(c => (
              <Link key={c.id} to={`/complaints/${c.id}`} className="db-list-row">
                <div style={{ width:48, height:48, borderRadius:14, background:'#f0fdf4', border:'1.5px solid #dcfce7', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {c.imageUrl ? (
                    <img src={`http://localhost:8084${c.imageUrl}`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <span style={{ fontSize:20 }}>🏙️</span>
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:800, fontSize:14, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.area}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:4 }}>
                    {c.createdAt && <span style={{ fontSize:11, color:'#a8a29e', fontWeight:600 }}>📅 {new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>}
                    {c.teamName  && <span style={{ fontSize:11, color:'#2563eb', fontWeight:600 }}>👥 {c.teamName}</span>}
                    {c.aiSteps   && <span style={{ fontSize:11, color:'#15803d', fontWeight:600 }}>🤖 AI plan ready</span>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  <StatusBadge status={c.status} />
                  <span style={{ color:'#d6d3d1', fontSize:16, fontWeight:700 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Quick links ── */}
        {!loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginTop:36 }}>
            {[
              { to:'/',         icon:'🌿', title:'Home',            desc:'Back to landing page',           accent:'#15803d' },
              { to:'/events',   icon:'🗓️', title:'Upcoming Events', desc:'Join cleanliness drives near you', accent:'#7c3aed' },
              { to:'/articles', icon:'📰', title:'Read Articles',   desc:'Learn about civic cleanliness',    accent:'#0891b2' },
              { to:'/profile',  icon:'👤', title:'My Profile',      desc:'View your account details',        accent:'#2563eb' },
              ...(isAdmin ? [{ to:'/admin', icon:'⚙️', title:'Admin Panel', desc:'Manage teams, complaints & users', accent:'#d97706' }] : []),
            ].map(link => (
              <Link key={link.to} to={link.to} className="db-quick-link">
                <div style={{ width:44, height:44, borderRadius:14, background:'#fffdf7', border:'1.5px solid #f0ede8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, transition:'transform 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}
                >{link.icon}</div>
                <div>
                  <p style={{ fontSize:14, fontWeight:800, color:'#1c1917', marginBottom:2 }}>{link.title}</p>
                  <p style={{ fontSize:12, color:'#a8a29e', fontWeight:600 }}>{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}