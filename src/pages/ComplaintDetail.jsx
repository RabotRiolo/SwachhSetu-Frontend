import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import complaintService from '../services/ComplaintService'
import StatusBadge from '../components/StatusBridge'
import AiResultCard, { resolveCleanPreviewUrl } from '../components/AiResultCard'

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']

const STATUS_CONFIG = {
  PENDING:     { icon: '⏳', label: 'Pending',     textColor: '#d97706', bg: '#fffbeb', border: '#fde68a', desc: 'Your complaint has been received and is waiting for admin review.' },
  ASSIGNED:    { icon: '👥', label: 'Assigned',    textColor: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', desc: 'A cleaning team has been assigned and will begin work soon.' },
  IN_PROGRESS: { icon: '🔧', label: 'In Progress', textColor: '#c2410c', bg: '#fff7ed', border: '#fed7aa', desc: 'The cleaning team is actively working on this area right now.' },
  RESOLVED:    { icon: '✅', label: 'Resolved',    textColor: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', desc: 'This complaint has been resolved. The area has been cleaned!' },
}

function hasAiContent(v) {
  if (v == null) return false
  if (typeof v === 'string') return v.trim().length > 0
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  return true
}

export default function ComplaintDetail() {
  const { id } = useParams()

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)
  const [imgError, setImgError]   = useState(false)
  const [imgZoom, setImgZoom]     = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    complaintService.getById(id)
      .then(r => setComplaint(r.data?.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ ...S.page, padding: '32px 20px 80px' }}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="sk" style={{ height: 14, width: 130, marginBottom: 32 }} />
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div className="sk" style={{ height: 300, borderRadius: 0 }} />
            <div style={{ padding: '36px 40px' }}>
              <div className="sk" style={{ height: 24, width: '60%', marginBottom: 14 }} />
              <div className="sk" style={{ height: 14, width: '30%', marginBottom: 28 }} />
              <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                {[1,2,3,4].map(i => <div key={i} className="sk" style={{ flex: 1, height: 56, borderRadius: 16 }} />)}
              </div>
              <div className="sk" style={{ height: 120, borderRadius: 16 }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div
        style={{
          ...S.page,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 20px 80px',
          minHeight: '100vh',
        }}
      >
        <style>{CSS}</style>
        <div style={{ ...S.card, padding: '56px 48px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📋</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 900, marginBottom: 10, letterSpacing: '-0.02em', color: '#1c1917' }}>Complaint Not Found</h2>
          <p style={{ color: '#78716c', fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
            This complaint may have been removed or the link is incorrect.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/dashboard" className="btn-main" style={{ justifyContent: 'center' }}>← Back to Dashboard</Link>
            <Link to="/complaints/new" style={{ color: '#15803d', fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>📸 Report New Complaint</Link>
          </div>
        </div>
      </div>
    )
  }

  const statusCfg   = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.PENDING
  const currentStep = STATUS_STEPS.indexOf(complaint.status)
  const hasAi       = hasAiContent(complaint.aiSteps) || !!resolveCleanPreviewUrl(complaint)
  const formattedDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const formattedTime = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      <div
        style={{
          background: '#1c1917',
          height: 170,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            background:
              'radial-gradient(circle,rgba(21,128,61,0.35),transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -40,
            width: 220,
            height: 220,
            background:
              'radial-gradient(circle,rgba(217,119,6,0.18),transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 60px' }}>
        <Link to="/dashboard" className="back-link fade-up d1" style={{ marginTop: 24 }}>
          <span>←</span> Back to Dashboard
        </Link>

        <div className="cd-card fade-up d2" style={{ marginBottom: 20 }}>
          <div
            style={{ position: 'relative', height: 300, background: 'linear-gradient(135deg, #d6d3d1 0%, #a8a29e 100%)', overflow: 'hidden', cursor: complaint.imageUrl && !imgError ? 'zoom-in' : 'default' }}
            onClick={() => complaint.imageUrl && !imgError && setImgZoom(true)}
          >
            {complaint.imageUrl && !imgError ? (
              <img
                src={`http://localhost:8084${complaint.imageUrl}`}
                alt={complaint.area}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.25 }}>
                <span style={{ fontSize: 96 }}>🏙️</span>
              </div>
            )}

            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,25,23,0.75) 0%, rgba(28,25,23,0.1) 50%, transparent 100%)' }} />

            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={complaint.status} />
              {hasAi && (
                <span style={{ background: 'rgba(124,58,237,0.88)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, background: '#c4b5fd', borderRadius: '50%', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                  AI Analyzed
                </span>
              )}
            </div>

            {complaint.imageUrl && !imgError && (
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100 }}>
                🔍 Click to zoom
              </div>
            )}

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 32px' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', marginBottom: 6 }}>📍 REPORTED AREA</p>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {complaint.area}
              </h1>
            </div>
          </div>

          <div style={{ padding: '32px 36px 36px' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span style={S.tag}>🗺️ Complaint Progress</span>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 2, background: '#f0ede8', zIndex: 0 }} />
                <div style={{
                  position: 'absolute', top: 20, left: 20, height: 2,
                  background: '#15803d', zIndex: 0, transition: 'width 0.7s ease',
                  width: currentStep === 0 ? '0%' : `${(currentStep / (STATUS_STEPS.length - 1)) * 90}%`,
                }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between' }}>
                  {STATUS_STEPS.map((step, i) => {
                    const cfg       = STATUS_CONFIG[step]
                    const isDone    = i < currentStep
                    const isCurrent = i === currentStep
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', border: '2px solid',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, transition: 'all 0.3s',
                          background:   isDone ? '#15803d' : isCurrent ? cfg.bg   : '#fff',
                          borderColor:  isDone ? '#15803d' : isCurrent ? cfg.border : '#e7e5e4',
                          color:        isDone ? '#fff'    : isCurrent ? cfg.textColor : '#d6d3d1',
                          boxShadow:    isCurrent ? `0 4px 16px ${cfg.border}` : isDone ? '0 4px 12px rgba(21,128,61,0.2)' : 'none',
                        }}>
                          {isDone ? '✓' : cfg.icon}
                        </div>
                        <p style={{
                          fontSize: 11, fontWeight: 800, textAlign: 'center', lineHeight: 1.3,
                          color: isDone ? '#15803d' : isCurrent ? cfg.textColor : '#d6d3d1',
                        }}>
                          {cfg.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginTop: 20, background: statusCfg.bg, border: `1.5px solid ${statusCfg.border}`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{statusCfg.icon}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: statusCfg.textColor, marginBottom: 3 }}>{statusCfg.label}</p>
                  <p style={{ fontSize: 13, color: statusCfg.textColor, opacity: 0.8, lineHeight: 1.5 }}>{statusCfg.desc}</p>
                </div>
              </div>
            </div>

            <div className="cd-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
              {formattedDate && <InfoBox icon="📅" label="Reported On" value={formattedDate} sub={formattedTime} />}
              {/* FIX: Always show Assigned Team box, with fallback when not yet assigned */}
              <InfoBox
                icon="👥"
                label="Assigned Team"
                value={complaint.teamName || 'Not assigned yet'}
                accent={complaint.teamName ? '#1d4ed8' : '#a8a29e'}
              />
              <InfoBox icon={statusCfg.icon}       label="Current Status" value={statusCfg.label}                   accent={statusCfg.textColor} />
              <InfoBox icon={hasAi ? '🤖' : '⏳'}  label="AI Analysis"   value={hasAi ? 'Completed' : 'Pending'}   accent={hasAi ? '#7c3aed' : '#a8a29e'} />
            </div>

            {hasAi && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={S.tagAi}>🤖 AI insight</span>
                </div>
                <AiResultCard complaint={complaint} />
              </div>
            )}

            {!hasAi && (
              <div
                style={{
                  background: '#fafaf8',
                  border: '1.5px solid #f0ede8',
                  borderRadius: 28,
                  padding: '28px 22px',
                  marginBottom: 24,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                <p
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#1c1917',
                    marginBottom: 8,
                  }}
                >
                  AI insight pending
                </p>
                <p style={{ fontSize: 13, color: '#78716c', lineHeight: 1.65, fontWeight: 600 }}>
                  A cleaning plan and preview image will show here after this report is processed.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 24, borderTop: '1.5px solid #f3f4f6' }}>
              <Link to="/complaints/new" className="btn-main" style={{ flex: 1, justifyContent: 'center' }}>
                <span>📸</span> Report Another Issue
              </Link>
              <Link to="/dashboard" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <span>📊</span> View All Complaints
              </Link>
            </div>
          </div>
        </div>

        <div className="fade-up d3" style={{ ...S.card, padding: '22px 24px' }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 900, color: '#1c1917', marginBottom: 16 }}>
            Also explore
          </p>
          <div className="cd-quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { to: '/dashboard', icon: '📊', title: 'Dashboard',  desc: 'All your complaints' },
              { to: '/events',    icon: '🗓️', title: 'Events',     desc: 'Join drives near you' },
              { to: '/articles',  icon: '📰', title: 'Articles',   desc: 'Learn & stay informed' },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="cd-quick-link">
                <span style={{ fontSize: 22, flexShrink: 0 }}>{link.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#1c1917',
                      marginBottom: 2,
                    }}
                  >
                    {link.title}
                  </p>
                  <p style={{ fontSize: 11, color: '#a8a29e', fontWeight: 700 }}>{link.desc}</p>
                </div>
                <span style={{ color: '#d6d3d1', fontSize: 15, marginLeft: 'auto', fontWeight: 700 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {imgZoom && (
        <div
          onClick={() => setImgZoom(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.92)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}
        >
          <button
            type="button"
            onClick={() => setImgZoom(false)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
          >✕</button>
          <img
            src={`http://localhost:8084${complaint.imageUrl}`}
            alt={complaint.area}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.5)', objectFit: 'contain' }}
          />
          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, whiteSpace: 'nowrap' }}>
            {complaint.area}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoBox({ icon, label, value, sub, accent = '#1c1917' }) {
  return (
    <div style={{ background: '#fafaf8', borderRadius: 18, padding: '14px 16px', border: '1.5px solid #f0ede8' }}>
      <p style={{ fontSize: 11, color: '#a8a29e', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>{icon}</span> {label.toUpperCase()}
      </p>
      <p style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.4, color: accent }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 3, fontWeight: 600 }}>{sub}</p>}
    </div>
  )
}

const S = {
  page: {
    fontFamily: "'Nunito', 'DM Sans', sans-serif",
    background: '#fffdf7',
    color: '#1c1917',
    lineHeight: 1.6,
    minHeight: '100vh',
    padding: '0',
  },
  card: {
    background: '#fff',
    borderRadius: 28,
    border: '1.5px solid #f0ede8',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  tag: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#f0fdf4', color: '#15803d',
    padding: '7px 16px', borderRadius: 100,
    fontSize: 12, fontWeight: 800, letterSpacing: '0.04em',
    border: '1.5px solid #bbf7d0',
  },
  tagAi: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#faf5ff',
    color: '#6d28d9',
    padding: '7px 16px',
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.04em',
    border: '1.5px solid #e9d5ff',
  },
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer   { 0%,100%{opacity:1} 50%{opacity:0.45} }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .fade-up { animation: fadeUp 0.6s ease both; }
  .d1{animation-delay:0.05s} .d2{animation-delay:0.15s} .d3{animation-delay:0.25s}
  .sk { background:#e7e5e4; border-radius:8px; animation:shimmer 1.4s ease-in-out infinite; display:block; }
  .cd-card { background:#fff; border-radius:28px; border:1.5px solid #f0ede8; box-shadow:0 2px 8px rgba(0,0,0,0.03); overflow:hidden; }
  .back-link { display:inline-flex; align-items:center; gap:6px; color:#15803d; text-decoration:none; font-size:14px; font-weight:800; margin-bottom:24px; transition:all 0.2s; }
  .back-link:hover { color:#166534; gap:8px; }
  .btn-main { background:#15803d; color:#fff; padding:14px 28px; border-radius:100px; font-size:14px; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:all 0.25s; box-shadow:0 6px 20px rgba(21,128,61,0.22); font-family:inherit; cursor:pointer; border:none; }
  .btn-main:hover { background:#166534; transform:translateY(-2px); box-shadow:0 12px 32px rgba(21,128,61,0.3); }
  .btn-secondary { background:#fff; color:#15803d; padding:14px 28px; border-radius:100px; font-size:14px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:8px; border:2px solid #bbf7d0; transition:all 0.25s; font-family:inherit; cursor:pointer; }
  .btn-secondary:hover { border-color:#15803d; background:#f0fdf4; transform:translateY(-2px); }
  .cd-quick-link {
    display:flex; align-items:center; gap:14px; padding:18px; text-decoration:none; color:inherit;
    border-radius:20px; border:1.5px solid #f0ede8; background:#fff; transition:all 0.25s;
  }
  .cd-quick-link:hover {
    border-color:#bbf7d0; background:#fafff8; box-shadow:0 8px 24px rgba(0,0,0,0.06); transform:translateY(-2px);
  }
  @media(max-width:768px) {
    .cd-quick-grid { grid-template-columns:1fr !important; }
    .cd-info-grid { grid-template-columns:1fr !important; }
  }
  ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#fffdf7} ::-webkit-scrollbar-thumb{background:#d6d3d1;border-radius:3px}
`