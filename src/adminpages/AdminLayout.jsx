import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/admin',            icon: '📊', label: 'Dashboard',  exact: true  },
  { to: '/admin/complaints', icon: '📋', label: 'Complaints', exact: false },
  { to: '/admin/teams',      icon: '👷', label: 'Teams',      exact: false },
  { to: '/admin/events',     icon: '🗓️', label: 'Events',     exact: false },
  { to: '/admin/articles',   icon: '📰', label: 'Articles',   exact: false },
]

export default function AdminLayout() {
  const { user, logout }            = useAuth()
  const navigate                    = useNavigate()
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => { logout(); navigate('/') } 

  const firstName = user?.name?.split(' ')[0]

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", display:'flex', height:'100vh', background:'#fffdf7', overflow:'hidden', color:'#1c1917' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; }

        @keyframes pulse-ring { 0%{transform:scale(0.9);opacity:0.8} 100%{transform:scale(1.4);opacity:0} }
        @keyframes slideIn    { from{transform:translateX(-100%)} to{transform:translateX(0)} }

        /* Sidebar nav links */
        .adm-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 14px;
          font-size: 14px; font-weight: 700;
          text-decoration: none; color: #78716c;
          transition: all 0.2s; white-space: nowrap; overflow: hidden;
        }
        .adm-nav-link:hover  { background: #f0fdf4; color: #15803d; }
        .adm-nav-link.active { background: linear-gradient(135deg,#dcfce7,#f0fdf4); color: #15803d; box-shadow: 0 2px 8px rgba(21,128,61,0.12); border: 1px solid #bbf7d0; }

        .adm-nav-icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }

        /* Collapsed icon-only links */
        .adm-nav-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 12px;
          text-decoration: none; font-size: 18px;
          transition: all 0.2s; color: #78716c;
        }
        .adm-nav-icon-btn:hover  { background: #f0fdf4; color: #15803d; }
        .adm-nav-icon-btn.active { background: linear-gradient(135deg,#dcfce7,#f0fdf4); box-shadow: 0 2px 8px rgba(21,128,61,0.12); }

        /* Sidebar action buttons */
        .adm-side-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 12px; border-radius: 12px;
          font-size: 13px; font-weight: 700; font-family: inherit;
          background: none; border: none; cursor: pointer;
          width: 100%; text-align: left; transition: all 0.2s;
          text-decoration: none; color: #78716c;
        }
        .adm-side-btn:hover    { background: #f5f5f4; color: #1c1917; }
        .adm-side-btn.danger   { color: #ef4444; }
        .adm-side-btn.danger:hover { background: #fef2f2; }
        .adm-side-btn.collapse { color: #a8a29e; }

        /* Topbar */
        .adm-topbar {
          height: 60px; background: rgba(255,253,247,0.97);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1.5px solid #f0ede8;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; flex-shrink: 0;
          position: sticky; top: 0; z-index: 20;
        }

        /* Mobile drawer */
        .adm-drawer {
          position: fixed; top: 0; left: 0; height: 100%;
          width: 260px; background: #fff;
          box-shadow: 0 0 60px rgba(0,0,0,0.15);
          z-index: 40; display: flex; flex-direction: column;
          animation: slideIn 0.25s ease;
          border-right: 1.5px solid #f0ede8;
        }

        .adm-backdrop {
          position: fixed; inset: 0;
          background: rgba(28,25,23,0.5);
          backdrop-filter: blur(4px);
          z-index: 30;
        }

        /* Avatar */
        .adm-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg,#15803d,#059669);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 900; font-size: 13px;
          font-family: 'Fraunces',serif;
          box-shadow: 0 2px 8px rgba(21,128,61,0.25);
          flex-shrink: 0;
        }

        .adm-report-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #15803d; color: #fff;
          padding: 8px 16px; border-radius: 100px;
          font-size: 12px; font-weight: 800; text-decoration: none;
          box-shadow: 0 3px 10px rgba(21,128,61,0.2);
          transition: all 0.2s;
        }
        .adm-report-btn:hover { background: #166534; transform: translateY(-1px); }

        .adm-hamburger {
          background: none; border: none; cursor: pointer;
          padding: 8px; border-radius: 10px; color: #78716c;
          transition: all 0.2s;
        }
        .adm-hamburger:hover { background: #f0fdf4; color: #15803d; }

        /* Scrollbar */
        .adm-nav-scroll::-webkit-scrollbar { width: 4px; }
        .adm-nav-scroll::-webkit-scrollbar-track { background: transparent; }
        .adm-nav-scroll::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 2px; }

        @media (min-width: 1024px) { .adm-mobile-only { display: none !important; } }
        @media (max-width: 1023px) { .adm-desktop-only { display: none !important; } }
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="adm-desktop-only" style={{
        width: collapsed ? 64 : 224, flexShrink: 0,
        background: '#fff', borderRight: '1.5px solid #f0ede8',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        boxShadow: '2px 0 12px rgba(0,0,0,0.03)',
      }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '16px 12px' : '16px 16px', borderBottom: '1.5px solid #f0ede8', display:'flex', alignItems:'center', gap:10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#15803d,#059669)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 3px 10px rgba(21,128,61,0.25)', flexShrink:0 }}>🌿</div>
            {!collapsed && (
              <div>
                <div style={{ fontFamily:'Fraunces,serif', fontSize:16, fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917', lineHeight:1.1 }}>SwachhSetu</div>
                <div style={{ fontSize:10, color:'#a8a29e', fontWeight:700, letterSpacing:'0.04em' }}>ADMIN PANEL</div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="adm-nav-scroll" style={{ flex:1, padding: collapsed ? '12px 8px' : '12px 10px', display:'flex', flexDirection:'column', gap:4, overflowY:'auto' }}>
          {/* Admin tag */}
          {!collapsed && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#f5f3ff', border:'1px solid #e9d5ff', borderRadius:100, padding:'4px 10px', marginBottom:8, width:'fit-content' }}>
              <span style={{ width:6, height:6, background:'#7c3aed', borderRadius:'50%', flexShrink:0 }} />
              <span style={{ fontSize:10, fontWeight:800, color:'#7c3aed', letterSpacing:'0.06em' }}>ADMIN</span>
            </div>
          )}

          {NAV_ITEMS.map(item => (
            collapsed ? (
              <NavLink key={item.to} to={item.to} end={item.exact} title={item.label}
                className={({ isActive }) => `adm-nav-icon-btn ${isActive ? 'active' : ''}`}>
                {item.icon}
              </NavLink>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.exact}
                className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}>
                <span className="adm-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop:'1.5px solid #f0ede8', padding: collapsed ? '10px 8px' : '10px 10px', display:'flex', flexDirection:'column', gap:4 }}>
          {/* User card */}
          {!collapsed && (
            <Link to="/profile" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 10px', background:'#fafaf8', borderRadius:12, border:'1px solid #f0ede8', marginBottom:4, textDecoration:'none', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f5f5f4'} onMouseLeave={e => e.currentTarget.style.background = '#fafaf8'}>
              <div className="adm-avatar" style={{ width:28, height:28, fontSize:11 }}>{(user?.name?.[0] || 'U').toUpperCase()}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize:10, color:'#a8a29e', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
              </div>
            </Link>
          )}

          <Link to="/" className="adm-side-btn" style={ collapsed ? { justifyContent:'center', padding:'9px 0' } : {} } title={collapsed ? 'View Site' : undefined}>
            <span>🌐</span>{!collapsed && 'View Site'}
          </Link>

          <button onClick={handleLogout} className="adm-side-btn danger" style={ collapsed ? { justifyContent:'center', padding:'9px 0' } : {} } title={collapsed ? 'Logout' : undefined}>
            <span>🚪</span>{!collapsed && 'Logout'}
          </button>

          <button onClick={() => setCollapsed(c => !c)} className="adm-side-btn collapse" style={{ justifyContent: 'flex-start', padding: '9px 12px' }}>
            <span style={{ fontSize:14 }}>{collapsed ? '→' : '←'}</span>
            <span>{collapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <>
          <div className="adm-backdrop adm-mobile-only" onClick={() => setMobileOpen(false)} />
          <div className="adm-drawer adm-mobile-only">
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px', borderBottom:'1.5px solid #f0ede8' }}>
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, background:'linear-gradient(135deg,#15803d,#059669)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 3px 10px rgba(21,128,61,0.25)' }}>🌿</div>
                <div>
                  <div style={{ fontFamily:'Fraunces,serif', fontSize:16, fontWeight:900, color:'#1c1917' }}>SwachhSetu</div>
                  <div style={{ fontSize:10, color:'#a8a29e', fontWeight:700, letterSpacing:'0.04em' }}>ADMIN PANEL</div>
                </div>
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#a8a29e', padding:4 }}>✕</button>
            </div>

            {/* Nav */}
            <nav className="adm-nav-scroll" style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:4, overflowY:'auto' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#f5f3ff', border:'1px solid #e9d5ff', borderRadius:100, padding:'4px 10px', marginBottom:8, width:'fit-content' }}>
                <span style={{ width:6, height:6, background:'#7c3aed', borderRadius:'50%' }} />
                <span style={{ fontSize:10, fontWeight:800, color:'#7c3aed', letterSpacing:'0.06em' }}>ADMIN</span>
              </div>
              {NAV_ITEMS.map(item => (
                <NavLink key={item.to} to={item.to} end={item.exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}>
                  <span className="adm-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Bottom */}
            <div style={{ borderTop:'1.5px solid #f0ede8', padding:'12px 10px', display:'flex', flexDirection:'column', gap:4 }}>
              <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#fafaf8', borderRadius:12, border:'1px solid #f0ede8', marginBottom:4, textDecoration:'none', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f5f5f4'} onMouseLeave={e => e.currentTarget.style.background = '#fafaf8'}>
                <div className="adm-avatar">{(user?.name?.[0] || 'U').toUpperCase()}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                  <div style={{ fontSize:11, color:'#a8a29e', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
                </div>
              </Link>
              <Link to="/" onClick={() => setMobileOpen(false)} className="adm-side-btn"><span>🌐</span> View Site</Link>
              <button onClick={handleLogout} className="adm-side-btn danger"><span>🚪</span> Logout</button>
            </div>
          </div>
        </>
      )}

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

        {/* Topbar */}
        <header className="adm-topbar">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Hamburger — mobile */}
            <button className="adm-hamburger adm-mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Mobile logo */}
            <Link to="/admin" className="adm-mobile-only" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, background:'linear-gradient(135deg,#15803d,#059669)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🌿</div>
              <span style={{ fontFamily:'Fraunces,serif', fontSize:15, fontWeight:900, color:'#1c1917' }}>Admin</span>
            </Link>

            {/* Desktop breadcrumb */}
            <div className="adm-desktop-only" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f5f3ff', border:'1.5px solid #e9d5ff', borderRadius:100, padding:'5px 12px' }}>
                <span style={{ width:6, height:6, background:'#7c3aed', borderRadius:'50%' }}>
                </span>
                <span style={{ fontSize:12, fontWeight:800, color:'#7c3aed', letterSpacing:'0.04em' }}>Admin Panel</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Link to="/complaints/new" className="adm-report-btn adm-desktop-only">
              <span>📸</span> New Report
            </Link>

            <Link to="/profile" style={{ display:'flex', alignItems:'center', gap:10, paddingLeft:12, borderLeft:'1.5px solid #f0ede8', textDecoration:'none', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <div className="adm-avatar">{(user?.name?.[0] || 'U').toUpperCase()}</div>
              <div className="adm-desktop-only">
                <div style={{ fontSize:12, fontWeight:800, color:'#1c1917', lineHeight:1.2 }}>{firstName}</div>
                <div style={{ fontSize:11, color:'#7c3aed', fontWeight:700, lineHeight:1 }}>Admin</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', padding:'28px 5%', background:'#fffdf7' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
