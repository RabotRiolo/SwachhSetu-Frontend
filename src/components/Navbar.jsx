import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, userIsAdmin } from '../contexts/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/events', label: 'Events', exact: false },
  { to: '/articles', label: 'Articles', exact: false },
]

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const loggedIn = isLoggedIn()
  const isAdmin = userIsAdmin(user)
  const firstName = user?.name?.split(' ')[0]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        .ss-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,253,247,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          font-family: 'Nunito', sans-serif;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .ss-nav.scrolled {
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          border-bottom: 1.5px solid #e7e5e4;
        }
        .ss-nav.flat {
          border-bottom: 1.5px solid #f0ede8;
        }
        .ss-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 5%;
          display: flex; align-items: center; justify-content: space-between;
          height: 68px;
        }

        /* Logo */
        .ss-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .ss-logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #15803d, #059669);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 14px rgba(21,128,61,0.25);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .ss-logo:hover .ss-logo-icon { transform: scale(1.1) rotate(-3deg); box-shadow: 0 8px 24px rgba(21,128,61,0.35); }
        .ss-logo-name {
          font-family: 'Fraunces', serif;
          font-size: 22px; font-weight: 900;
          letter-spacing: -0.02em;
          color: #1c1917;
          transition: color 0.2s;
        }
        .ss-logo:hover .ss-logo-name { color: #15803d; }
        .ss-logo-sub { font-size: 11px; color: #a8a29e; font-weight: 700; letter-spacing: 0.02em; line-height: 1; margin-top: 2px; }

        /* Desktop nav links */
        .ss-links { display: flex; align-items: center; gap: 4px; }
        .ss-link {
          font-size: 14px; font-weight: 700;
          color: #78716c;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 100px;
          transition: all 0.2s;
          position: relative;
        }
        .ss-link:hover { color: #15803d; background: #f0fdf4; }
        .ss-link.active { color: #15803d; background: #f0fdf4; }
        .ss-link-admin { color: #7c3aed !important; }
        .ss-link-admin:hover { background: #f5f3ff !important; color: #6d28d9 !important; }
        .ss-link-admin.active { background: #f5f3ff !important; color: #6d28d9 !important; }

        /* Buttons */
        .ss-btn-report {
          display: inline-flex; align-items: center; gap: 8px;
          background: #15803d; color: #fff;
          padding: 10px 20px; border-radius: 100px;
          font-size: 14px; font-weight: 800;
          text-decoration: none;
          border: none; cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 14px rgba(21,128,61,0.25);
          white-space: nowrap;
        }
        .ss-btn-report:hover { background: #166534; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(21,128,61,0.35); }

        .ss-btn-login {
          font-size: 14px; font-weight: 700;
          color: #78716c; text-decoration: none;
          padding: 10px 18px; border-radius: 100px;
          transition: all 0.2s;
        }
        .ss-btn-login:hover { color: #15803d; background: #f0fdf4; }

        .ss-btn-register {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fff; color: #15803d;
          padding: 9px 20px; border-radius: 100px;
          font-size: 14px; font-weight: 800;
          text-decoration: none;
          border: 2px solid #bbf7d0;
          transition: all 0.25s;
        }
        .ss-btn-register:hover { border-color: #15803d; background: #f0fdf4; transform: translateY(-2px); }

        /* Live dot */
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .live-dot {
          width: 8px; height: 8px;
          background: #22c55e; border-radius: 50%;
          position: relative; flex-shrink: 0;
        }
        .live-dot::after {
          content: '';
          position: absolute; inset: -2px;
          background: #22c55e; border-radius: 50%;
          opacity: 0.4;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        /* User avatar button */
        .ss-avatar-btn {
          display: flex; align-items: center; gap: 10px;
          background: none; border: none; cursor: pointer;
          padding: 6px 8px 6px 12px;
          border-radius: 100px;
          border-left: 1.5px solid #e7e5e4;
          transition: background 0.2s;
        }
        .ss-avatar-btn:hover { background: #f5f5f4; }
        .ss-avatar {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #15803d, #059669);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 900; font-size: 13px;
          font-family: 'Fraunces', serif;
          box-shadow: 0 2px 8px rgba(21,128,61,0.25);
        }
        .ss-avatar-name { font-size: 13px; font-weight: 800; color: #1c1917; line-height: 1.2; }
        .ss-avatar-role { font-size: 11px; color: #7c3aed; font-weight: 700; line-height: 1; }
        .ss-chevron { width: 14px; height: 14px; color: #a8a29e; transition: transform 0.25s; }
        .ss-chevron.open { transform: rotate(180deg); }

        /* Dropdown */
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ss-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          width: 220px;
          background: #fff; border-radius: 20px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          border: 1.5px solid #f3f4f6;
          overflow: hidden;
          z-index: 200;
          animation: dropIn 0.2s ease both;
        }
        .ss-dropdown-header {
          padding: 14px 16px;
          background: #fffdf7;
          border-bottom: 1.5px solid #f0ede8;
        }
        .ss-dropdown-header-name { font-size: 13px; font-weight: 800; color: #1c1917; truncate: true; }
        .ss-dropdown-header-email { font-size: 11px; color: #a8a29e; font-weight: 600; margin-top: 2px; }
        .ss-admin-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #f5f3ff; color: #7c3aed;
          font-size: 11px; font-weight: 800;
          padding: 3px 10px; border-radius: 100px;
          margin-top: 6px;
          border: 1px solid #e9d5ff;
        }
        .ss-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px;
          font-size: 13px; font-weight: 700;
          color: #57534e; text-decoration: none;
          transition: all 0.15s; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
        }
        .ss-dropdown-item:hover { background: #f0fdf4; color: #15803d; }
        .ss-dropdown-item.danger { color: #ef4444; }
        .ss-dropdown-item.danger:hover { background: #fef2f2; color: #dc2626; }
        .ss-dropdown-item.admin-item { color: #7c3aed; }
        .ss-dropdown-item.admin-item:hover { background: #f5f3ff; color: #6d28d9; }
        .ss-dropdown-divider { height: 1.5px; background: #f3f4f6; margin: 4px 0; }
        .ss-dropdown-icon { font-size: 15px; width: 20px; text-align: center; }

        /* Mobile hamburger */
        .ss-hamburger {
          background: none; border: none; cursor: pointer;
          padding: 9px; border-radius: 12px;
          color: #78716c;
          transition: all 0.2s;
        }
        .ss-hamburger:hover { background: #f0fdf4; color: #15803d; }

        /* Mobile menu */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ss-mobile-menu {
          border-top: 1.5px solid #f0ede8;
          background: #fffdf7;
          padding: 16px 5% 20px;
          animation: slideDown 0.25s ease both;
        }
        .ss-mobile-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 14px;
          font-size: 14px; font-weight: 700;
          color: #57534e; text-decoration: none;
          transition: all 0.2s; margin-bottom: 4px;
        }
        .ss-mobile-link:hover { background: #f0fdf4; color: #15803d; }
        .ss-mobile-link.active { background: #dcfce7; color: #15803d; }
        .ss-mobile-link.admin { color: #7c3aed; }
        .ss-mobile-link.admin:hover, .ss-mobile-link.admin.active { background: #f5f3ff; }
        .ss-mobile-divider { height: 1.5px; background: #f0ede8; margin: 12px 0; }
        .ss-mobile-user-card {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          background: #fff; border-radius: 16px;
          border: 1.5px solid #f0ede8;
          margin-bottom: 10px;
        }
        .ss-mobile-btns { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
        .ss-mobile-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; border-radius: 14px;
          font-size: 14px; font-weight: 800;
          background: #15803d; color: #fff;
          text-decoration: none; border: none;
          box-shadow: 0 4px 14px rgba(21,128,61,0.2);
          transition: all 0.2s;
        }
        .ss-mobile-btn-primary:hover { background: #166534; }
        .ss-mobile-btn-secondary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; border-radius: 14px;
          font-size: 14px; font-weight: 700;
          background: #fff; color: #57534e;
          text-decoration: none;
          border: 1.5px solid #e7e5e4;
          transition: all 0.2s;
        }
        .ss-mobile-btn-secondary:hover { border-color: #bbf7d0; color: #15803d; background: #f0fdf4; }
        .ss-mobile-btn-logout {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; border-radius: 14px;
          font-size: 14px; font-weight: 700;
          color: #ef4444; background: none; border: none;
          cursor: pointer; width: 100%; text-align: left;
          transition: all 0.2s;
        }
        .ss-mobile-btn-logout:hover { background: #fef2f2; }

        /* Hide/show helpers */
        @media (max-width: 767px) { .ss-desktop { display: none !important; } }
        @media (min-width: 768px) { .ss-mobile-only { display: none !important; } }
      `}</style>

      <nav className={`ss-nav ${scrolled ? 'scrolled' : 'flat'}`}>
        <div className="ss-inner">

          {/* ── LOGO ── */}
          <Link to="/" className="ss-logo">
            <div className="ss-logo-icon">🌿</div>
            <div>
              <div className="ss-logo-name">SwachhSetu</div>
              <div className="ss-logo-sub ss-desktop">Clean India Initiative</div>
            </div>
          </Link>

          {/* ── LIVE TAG (desktop) ── */}
          <div className="ss-desktop" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 100, padding: '6px 14px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#15803d', letterSpacing: '0.04em' }}>Live in 10+ Cities</span>
          </div>

          {/* ── DESKTOP NAV LINKS ── */}
          <div className="ss-links ss-desktop">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) => `ss-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `ss-link ss-link-admin${isActive ? ' active' : ''}`}
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* ── DESKTOP RIGHT ── */}
          <div className="ss-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {loggedIn ? (
              <>
                <Link to="/complaints/new" className="ss-btn-report">
                  <span>📸</span> Report Issue
                </Link>

                <div style={{ position: 'relative' }} ref={userMenuRef}>
                  <button className="ss-avatar-btn" onClick={() => setUserMenuOpen(o => !o)}>
                    <div className="ss-avatar">{firstName?.[0]?.toUpperCase()}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div className="ss-avatar-name">{firstName}</div>
                      {isAdmin && (
                        <div className="ss-avatar-role d-flex justify-content-center align-items-center">
                          Admin
                        </div>
                      )}
                    </div>
                    <svg className={`ss-chevron ${userMenuOpen ? 'open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="ss-dropdown">
                      <div className="ss-dropdown-header">
                        <div className="ss-dropdown-header-name">{user?.name}</div>
                        <div className="ss-dropdown-header-email">{user?.email}</div>
                        {isAdmin && <div className="ss-admin-badge">⚙️ Admin</div>}
                      </div>

                      <div style={{ padding: '6px 0' }}>
                        <Link to="/dashboard" className="ss-dropdown-item">
                          <span className="ss-dropdown-icon">📊</span> Dashboard
                        </Link>
                        <Link to="/profile" className="ss-dropdown-item">
                          <span className="ss-dropdown-icon">👤</span> Profile
                        </Link>
                        <Link to="/complaints/new" className="ss-dropdown-item">
                          <span className="ss-dropdown-icon">📸</span> Report Issue
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="ss-dropdown-item admin-item">
                            <span className="ss-dropdown-icon">⚙️</span> Admin Panel
                          </Link>
                        )}
                      </div>

                      <div className="ss-dropdown-divider" />
                      <div style={{ padding: '6px 0' }}>
                        <button className="ss-dropdown-item danger" onClick={handleLogout}>
                          <span className="ss-dropdown-icon">🚪</span> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="ss-btn-login">Login</Link>
                <Link to="/register" className="ss-btn-register">🚀 Get Started</Link>
              </>
            )}
          </div>

          {/* ── MOBILE RIGHT ── */}
          <div className="ss-mobile-only" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {loggedIn && (
              <Link to="/complaints/new" className="ss-btn-report" style={{ padding: '9px 14px' }}>
                <span>📸</span>
              </Link>
            )}
            <button className="ss-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
              {mobileOpen ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <div className="ss-mobile-menu ss-mobile-only">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) => `ss-mobile-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `ss-mobile-link admin${isActive ? ' active' : ''}`}>
                ⚙️ Admin Panel
              </NavLink>
            )}

            <div className="ss-mobile-divider" />

            {loggedIn ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `ss-mobile-link${isActive ? ' active' : ''}`}>📊 Dashboard</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `ss-mobile-link${isActive ? ' active' : ''}`}>👤 Profile</NavLink>
                <NavLink to="/complaints/new" className={({ isActive }) => `ss-mobile-link${isActive ? ' active' : ''}`}>📸 Report Issue</NavLink>

                <div className="ss-mobile-divider" />

                <div className="ss-mobile-user-card">
                  <div className="ss-avatar" style={{ width: 40, height: 40, fontSize: 15, flexShrink: 0 }}>
                    {firstName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1c1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: '#a8a29e', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                  </div>
                </div>
                <button className="ss-mobile-btn-logout" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </button>
              </>
            ) : (
              <div className="ss-mobile-btns">
                <Link to="/register" className="ss-mobile-btn-primary">🚀 Get Started Free</Link>
                <Link to="/login" className="ss-mobile-btn-secondary">🔑 Login</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  )
}