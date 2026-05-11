import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../services/AdminService'
import StatusBadge from '../components/StatusBridge'

export default function AdminDashboard() {
  const [stats, setStats]                 = useState(null)
  const [recent, setRecent]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [recentLoading, setRecentLoading] = useState(true)

  useEffect(() => {
    adminService.getDashboardStats()
      .then(r => setStats(r.data?.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))

    adminService.getAllComplaints()
      .then(r => {
        const all    = r.data?.data || []
        const sorted = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRecent(sorted.slice(0, 8))
      })
      .catch(() => setRecent([]))
      .finally(() => setRecentLoading(false))
  }, [])

  const total      = stats?.totalComplaints      ?? 0
  const pending    = stats?.pendingComplaints    ?? 0
  const assigned   = stats?.assignedComplaints   ?? 0
  const inProgress = stats?.inProgressComplaints ?? 0
  const resolved   = stats?.resolvedComplaints   ?? 0
  const teams      = stats?.totalTeams           ?? 0
  const users      = stats?.totalUsers           ?? 0
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
  const activeWork     = assigned + inProgress

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28, fontFamily:"'Nunito','DM Sans',sans-serif" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .ad-fade { animation: fadeUp 0.5s ease both; }
        .ad-d1{animation-delay:0.05s} .ad-d2{animation-delay:0.1s} .ad-d3{animation-delay:0.15s} .ad-d4{animation-delay:0.2s}

        .ad-skeleton {
          background: linear-gradient(90deg,#f5f5f4 25%,#ede9e6 50%,#f5f5f4 75%);
          background-size: 400px 100%; animation: shimmer 1.4s ease infinite; border-radius: 12px;
        }

        .ad-stat-card {
          background: #fff; border: 1.5px solid #f0ede8; border-radius: 20px;
          padding: 20px; text-align: center; text-decoration: none;
          display: block; transition: all 0.25s; color: inherit;
        }
        .ad-stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); border-color: #bbf7d0; }

        .ad-quick-card {
          background: #fff; border: 1.5px solid #f0ede8; border-radius: 20px;
          padding: 20px; text-decoration: none; display: block;
          transition: all 0.25s; color: inherit;
        }
        .ad-quick-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); border-color: #bbf7d0; }

        .ad-row { display: flex; align-items: center; gap: 14px; padding: 13px 20px; text-decoration: none; color: inherit; border-bottom: 1.5px solid #f5f5f4; transition: background 0.15s; }
        .ad-row:last-child { border-bottom: none; }
        .ad-row:hover { background: #fafaf8; }

        .ad-btn-main {
          display: inline-flex; align-items: center; gap: 7px;
          background: #15803d; color: #fff; padding: 10px 20px; border-radius: 100px;
          font-size: 13px; font-weight: 800; text-decoration: none;
          box-shadow: 0 4px 14px rgba(21,128,61,0.25); transition: all 0.2s; font-family: inherit; border: none; cursor: pointer;
        }
        .ad-btn-main:hover { background: #166534; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(21,128,61,0.35); }

        .ad-section-title {
          font-family: 'Fraunces', serif; font-size: 18px; font-weight: 900;
          letter-spacing: -0.01em; color: #1c1917;
          display: flex; align-items: center; gap: 8px;
        }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div className="ad-fade ad-d1" style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:100, padding:'5px 14px', marginBottom:12 }}>
            <span style={{ width:7, height:7, background:'#22c55e', borderRadius:'50%' }} />
            <span style={{ fontSize:11, fontWeight:800, color:'#15803d', letterSpacing:'0.06em' }}>LIVE OVERVIEW</span>
          </div>
          <h1 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(24px,3vw,36px)', fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917', marginBottom:6, lineHeight:1.1 }}>
            Admin <span style={{ color:'#15803d', fontStyle:'italic' }}>Dashboard</span>
          </h1>
          <p style={{ fontSize:14, color:'#78716c', fontWeight:500 }}>Overview of all complaints, teams, and activity</p>
        </div>
        <Link to="/admin/complaints" className="ad-btn-main">
          <span>📋</span> View All Complaints
        </Link>
      </div>

      {/* ── STAT CARDS ── */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="ad-skeleton" style={{ height:100 }} />
          ))}
        </div>
      ) : (
        <>
          {/* Row 1 — complaint counts */}
          <div className="ad-fade ad-d2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
            {[
              { label:'Total',       value:total,      icon:'📋', accent:'#57534e', link:'/admin/complaints'                    },
              { label:'Pending',     value:pending,    icon:'⏳', accent:'#d97706', link:'/admin/complaints?filter=PENDING'     },
              { label:'Assigned',    value:assigned,   icon:'👥', accent:'#2563eb', link:'/admin/complaints?filter=ASSIGNED'    },
              { label:'In Progress', value:inProgress, icon:'🔧', accent:'#ea580c', link:'/admin/complaints?filter=IN_PROGRESS' },
              { label:'Resolved',    value:resolved,   icon:'✅', accent:'#15803d', link:'/admin/complaints?filter=RESOLVED'    },
            ].map(s => (
              <Link key={s.label} to={s.link} className="ad-stat-card">
                <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:32, fontWeight:900, color:s.accent, lineHeight:1, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:12, color:'#a8a29e', fontWeight:700 }}>{s.label}</div>
              </Link>
            ))}
          </div>

          {/* Row 2 — teams, users, rate, active */}
          <div className="ad-fade ad-d3" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
            {[
              { label:'Total Teams',     value:teams,             icon:'👷', accent:'#0891b2', link:'/admin/teams'   },
              { label:'Total Citizens',  value:users,             icon:'👥', accent:'#7c3aed', link:'#'              },
              { label:'Resolution Rate', value:`${resolutionRate}%`, icon:'🎯', accent:'#15803d', link:'/admin/complaints?filter=RESOLVED' },
              { label:'Active Work',     value:activeWork,        icon:'⚡', accent:'#d97706', link:'/admin/complaints' },
            ].map(s => (
              <Link key={s.label} to={s.link} className="ad-stat-card">
                <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:32, fontWeight:900, color:s.accent, lineHeight:1, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:12, color:'#a8a29e', fontWeight:700 }}>{s.label}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── PROGRESS ── */}
      {!loading && total > 0 && (
        <div className="ad-fade ad-d3" style={{ background:'#fff', borderRadius:24, border:'1.5px solid #f0ede8', padding:'24px 28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <p className="ad-section-title"><span>📈</span> Overall Progress</p>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'Fraunces,serif', fontSize:36, fontWeight:900, color:'#15803d', lineHeight:1 }}>{resolutionRate}%</div>
              <div style={{ fontSize:11, color:'#a8a29e', fontWeight:700, marginTop:2 }}>resolved</div>
            </div>
          </div>
          <div style={{ height:10, borderRadius:100, background:'#f0ede8', overflow:'hidden', display:'flex', marginBottom:16 }}>
            {[
              { value:pending,    color:'#fbbf24' },
              { value:assigned,   color:'#60a5fa' },
              { value:inProgress, color:'#fb923c' },
              { value:resolved,   color:'#15803d' },
            ].map((bar,i) => {
              const pct = (bar.value / total) * 100
              return pct > 0 ? <div key={i} style={{ width:`${pct}%`, height:'100%', background:bar.color, transition:'width 0.7s ease' }} /> : null
            })}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
            {[
              { color:'#fbbf24', label:'Pending',     value:pending    },
              { color:'#60a5fa', label:'Assigned',    value:assigned   },
              { color:'#fb923c', label:'In Progress', value:inProgress },
              { color:'#15803d', label:'Resolved',    value:resolved   },
            ].map(l => (
              <span key={l.label} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'#78716c', fontWeight:700 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:l.color, flexShrink:0 }} />
                {l.label}: {l.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <div className="ad-fade ad-d3" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
        {[
          { to:'/admin/complaints', icon:'📋', label:'All Complaints', desc:`${total} total`,      accent:'#15803d' },
          { to:'/admin/teams',      icon:'👷', label:'Manage Teams',   desc:`${teams} active`,     accent:'#2563eb' },
          { to:'/admin/events',     icon:'🗓️', label:'Manage Events',  desc:'Community drives',    accent:'#7c3aed' },
          { to:'/admin/articles',   icon:'📰', label:'Manage Articles',desc:'Publish awareness',   accent:'#0891b2' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="ad-quick-card">
            <div style={{ fontSize:28, marginBottom:10 }}>{a.icon}</div>
            <p style={{ fontFamily:'Fraunces,serif', fontSize:15, fontWeight:900, color:'#1c1917', marginBottom:4, letterSpacing:'-0.01em' }}>{a.label}</p>
            <p style={{ fontSize:12, color:'#a8a29e', fontWeight:600 }}>{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* ── RECENT COMPLAINTS ── */}
      <div className="ad-fade ad-d4" style={{ background:'#fff', borderRadius:24, border:'1.5px solid #f0ede8', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1.5px solid #f5f5f4' }}>
          <p className="ad-section-title"><span>🕐</span> Recent Complaints</p>
          <Link to="/admin/complaints" style={{ fontSize:13, fontWeight:800, color:'#15803d', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}
            onMouseEnter={e=>e.currentTarget.style.color='#166534'}
            onMouseLeave={e=>e.currentTarget.style.color='#15803d'}
          >View All →</Link>
        </div>

        {recentLoading ? (
          <div>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px', borderBottom:'1.5px solid #f5f5f4' }}>
                <div className="ad-skeleton" style={{ width:44,height:44,borderRadius:12,flexShrink:0 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                  <div className="ad-skeleton" style={{ height:13,width:'45%' }} />
                  <div className="ad-skeleton" style={{ height:11,width:'28%' }} />
                </div>
                <div className="ad-skeleton" style={{ width:72,height:24,borderRadius:100 }} />
              </div>
            ))}
          </div>

        ) : recent.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <p style={{ fontFamily:'Fraunces,serif', fontSize:20, fontWeight:900, color:'#1c1917', marginBottom:6 }}>No complaints yet</p>
            <p style={{ fontSize:14, color:'#a8a29e' }}>Complaints from citizens will appear here.</p>
          </div>

        ) : (
          <div>
            {recent.map(c => {
              const date = c.createdAt
                ? new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
                : ''
              return (
                <Link key={c.id} to={`/admin/complaints/${c.id}`} className="ad-row">
                  {/* Thumbnail */}
                  <div style={{ width:44,height:44,borderRadius:12,background:'#f0fdf4',border:'1.5px solid #dcfce7',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {c.imageUrl
                      ? <img src={`http://localhost:8084${c.imageUrl}`} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                      : <span style={{ fontSize:18 }}>🏙️</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:800, fontSize:14, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.area}</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:3 }}>
                      {c.userName && <span style={{ fontSize:11,color:'#a8a29e',fontWeight:600 }}>👤 {c.userName}</span>}
                      {date       && <span style={{ fontSize:11,color:'#a8a29e',fontWeight:600 }}>📅 {date}</span>}
                      {c.teamName && <span style={{ fontSize:11,color:'#2563eb',fontWeight:600 }}>👥 {c.teamName}</span>}
                      {c.aiSteps  && <span style={{ fontSize:11,color:'#7c3aed',fontWeight:600 }}>🤖 AI</span>}
                    </div>
                  </div>

                  {/* Status + arrow */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                    <StatusBadge status={c.status} />
                    <span style={{ color:'#d6d3d1', fontSize:14, fontWeight:700 }}>→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ── ATTENTION BANNER ── */}
      {!loading && pending > 0 && (
        <div className="ad-fade" style={{ background:'#fef9c3', border:'1.5px solid #fde68a', borderRadius:24, padding:'20px 24px', display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ fontSize:28, flexShrink:0 }}>⚠️</div>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:'Fraunces,serif', fontSize:17, fontWeight:900, color:'#92400e', marginBottom:6 }}>
              {pending} complaint{pending!==1?'s':''} need{pending===1?'s':''} attention
            </p>
            <p style={{ fontSize:13, color:'#a16207', marginBottom:16, lineHeight:1.6 }}>
              Pending complaints are waiting to be assigned to a cleaning team.
            </p>
            <Link to="/admin/complaints" className="ad-btn-main" style={{ background:'#d97706', boxShadow:'0 4px 14px rgba(217,119,6,0.3)' }}>
              <span>📋</span> Review Pending Complaints
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}