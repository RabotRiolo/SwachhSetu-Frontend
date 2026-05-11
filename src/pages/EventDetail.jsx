import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import eventService from '../services/EventService'
import resolveAssetUrl from '../utils/resolveAssetUrl'

function getDaysLeft(date) {
  const t = new Date(date).getTime()
  if (Number.isNaN(t)) return null
  const diff = Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0)   return { label: 'Event passed',     textColor: '#78716c', bg: '#f5f5f4', border: '#e7e5e4' }
  if (diff === 0) return { label: 'Today!',            textColor: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
  if (diff === 1) return { label: 'Tomorrow',          textColor: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' }
  if (diff <= 7)  return { label: `${diff} days left`, textColor: '#c2410c', bg: '#fff7ed', border: '#fed7aa' }
  return                 { label: `${diff} days left`, textColor: '#78716c', bg: '#f5f5f4', border: '#e7e5e4' }
}

export default function EventDetail() {
  const { id } = useParams()

  const [event, setEvent]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [imgError, setImgError] = useState(false)
  const [copied, setCopied]     = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    eventService.getEventById(id)
      .then(r => setEvent(r.data?.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* silent fail */ }
  }

  // ── LOADING SKELETON ─────────────────────────────────────
  if (loading) {
    return (
      <div style={S.page}>
        <style>{FONTS_AND_KEYFRAMES}</style>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="sk" style={{ height: 14, width: 120, marginBottom: 32 }} />
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div className="sk" style={{ height: 320, borderRadius: 0 }} />
            <div style={{ padding: '36px 40px' }}>
              <div className="sk" style={{ height: 28, width: '60%', marginBottom: 16 }} />
              <div className="sk" style={{ height: 14, width: '30%', marginBottom: 28 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                {[1,2,3,4].map(i => <div key={i} className="sk" style={{ height: 72, borderRadius: 16 }} />)}
              </div>
              {[1,2,3].map(i => <div key={i} className="sk" style={{ height: 14, marginBottom: 10, width: i===3?'70%':'100%' }} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── ERROR / NOT FOUND ────────────────────────────────────
  if (error || !event) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{FONTS_AND_KEYFRAMES}</style>
        <div style={{ ...S.card, padding: '56px 48px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🗓️</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 900, marginBottom: 10, letterSpacing: '-0.02em', color: '#1c1917' }}>Event Not Found</h2>
          <p style={{ color: '#78716c', fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
            This event may have been removed or the link is incorrect.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/events" className="btn-main" style={{ justifyContent: 'center' }}>
              ← Back to Events
            </Link>
            <Link to="/" style={{ color: '#a8a29e', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── DERIVED VALUES ───────────────────────────────────────
  const eventDate = event.eventDate ? new Date(event.eventDate) : null
  const eventDateValid = eventDate && !Number.isNaN(eventDate.getTime())
  const isPast         = eventDateValid && eventDate < new Date()
  const countdown      = eventDateValid ? getDaysLeft(event.eventDate) : null
  const heroImg        = resolveAssetUrl(event.imageUrl)

  const formattedDate = eventDateValid
    ? eventDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const formattedTime = eventDateValid
    ? eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null

  const createdDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const descParagraphs = event.description
    ? event.description.split('\n').map(p => p.trim()).filter(Boolean)
    : []

  // ── MAIN RENDER ──────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{FONTS_AND_KEYFRAMES}</style>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Back link */}
        <Link to="/events" className="back-link fade-up d1">
          <span>←</span> Back to Events
        </Link>

        {/* ── MAIN CARD ───────────────────────────────────── */}
        <div className="ev-card fade-up d2" style={{ marginBottom: 20 }}>

          {/* Hero image */}
          <div style={{ position: 'relative', height: 320, background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 60%, #fef9c3 100%)', overflow: 'hidden' }}>
            {heroImg && !imgError ? (
              <img
                src={heroImg}
                alt={event.title}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.25 }}>
                <span style={{ fontSize: 96 }}>🌿</span>
              </div>
            )}

            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,25,23,0.72) 0%, rgba(28,25,23,0.15) 50%, transparent 100%)' }} />

            {/* Status badges (top-left) */}
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
              <span style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800,
                background: isPast ? 'rgba(87,83,78,0.8)' : 'rgba(21,128,61,0.85)',
                color: '#fff', backdropFilter: 'blur(8px)',
              }}>
                {isPast ? '✓ Completed' : '🔜 Upcoming'}
              </span>
              {countdown && !isPast && (
                <span style={{
                  padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800,
                  background: countdown.bg, color: countdown.textColor,
                  border: `1.5px solid ${countdown.border}`,
                }}>
                  ⏰ {countdown.label}
                </span>
              )}
            </div>

            {/* Share button (top-right) */}
            <button type="button" className="share-btn" onClick={handleShare}>
              {copied ? '✅ Copied!' : '🔗 Share'}
            </button>

            {/* Title overlay */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 32px' }}>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {event.title}
              </h1>
            </div>
          </div>

          {/* ── CONTENT ──────────────────────────────────── */}
          <div style={{ padding: '32px 36px 36px' }}>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
              {formattedDate && <InfoBox icon="📅" label="Date"      value={formattedDate} accent="#15803d" />}
              {formattedTime && <InfoBox icon="⏰" label="Time"      value={formattedTime} accent="#1d4ed8" />}
              {event.location && <InfoBox icon="📍" label="Location" value={event.location} accent="#1c1917" />}
              {countdown     && <InfoBox icon={isPast ? '✓' : '⏳'} label={isPast ? 'Status' : 'Countdown'} value={countdown.label} accent={countdown.textColor} />}
              {createdDate   && <InfoBox icon="🗓️" label="Posted On" value={createdDate}   accent="#78716c" />}
            </div>

            {/* Description */}
            {descParagraphs.length > 0 && (
              <div style={{ borderTop: '1.5px solid #f3f4f6', paddingTop: 28, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={S.tag}>📋 About This Event</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {descParagraphs.map((para, i) => (
                    <p key={i} style={{ fontSize: i === 0 ? 16 : 14, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#1c1917' : '#57534e', lineHeight: 1.85 }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* How to participate (upcoming only) */}
            {!isPast && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: '24px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span style={{ ...S.tag, background: '#dcfce7', borderColor: '#86efac' }}>🤝 How to Participate</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: '📍', text: `Arrive at: ${event.location || 'the event venue'}` },
                    { icon: '🧤', text: 'Bring gloves, mask, and a water bottle' },
                    { icon: '👕', text: 'Wear comfortable, easy-to-move-in clothes' },
                    { icon: '🗑️', text: 'Waste bags and tools will be provided on site' },
                    { icon: '📸', text: 'Share the event to bring more volunteers!' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                      <span style={{ fontSize: 14, color: '#15803d', fontWeight: 600, lineHeight: 1.6 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past event message */}
            {isPast && (
              <div style={{ background: '#f5f5f4', border: '1.5px solid #e7e5e4', borderRadius: 20, padding: '28px 24px', marginBottom: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 900, color: '#1c1917', marginBottom: 6 }}>This event has concluded</p>
                <p style={{ fontSize: 14, color: '#78716c', lineHeight: 1.7 }}>
                  Thank you to everyone who participated and helped make India cleaner!
                </p>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {!isPast ? (
                <button onClick={handleShare} className="btn-main" style={{ flex: 1 }}>
                  <span>{copied ? '✅' : '🔗'}</span>
                  {copied ? 'Link Copied!' : 'Share Event'}
                </button>
              ) : (
                <Link to="/events" className="btn-main" style={{ flex: 1, justifyContent: 'center' }}>
                  <span>🔜</span> View Upcoming Events
                </Link>
              )}
              <Link to="/complaints/new" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <span>📸</span> Report Dirty Area
              </Link>
            </div>

          </div>
        </div>

        {/* ── ALSO EXPLORE ─────────────────────────────── */}
        <div className="fade-up d3" style={{ ...S.card, padding: '24px 28px' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#a8a29e', letterSpacing: '0.08em', marginBottom: 16 }}>ALSO EXPLORE</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { to: '/events',    icon: '🗓️', title: 'All Events',    desc: 'Browse more events',       bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
              { to: '/articles',  icon: '📰', title: 'Articles',       desc: 'Cleanliness awareness',    bg: '#fef9c3', border: '#fde68a', text: '#854d0e' },
              { to: '/dashboard', icon: '📊', title: 'My Dashboard',   desc: 'Track your complaints',    bg: '#dbeafe', border: '#bfdbfe', text: '#1d4ed8' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="quick-link"
                style={{ background: link.bg, borderColor: link.border, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{link.icon}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 13, color: link.text, marginBottom: 2 }}>{link.title}</p>
                  <p style={{ fontSize: 12, color: '#a8a29e', fontWeight: 600 }}>{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── INFO BOX COMPONENT ───────────────────────────────────────
function InfoBox({ icon, label, value, accent = '#1c1917' }) {
  return (
    <div style={{ background: '#fafaf8', borderRadius: 16, padding: '14px 16px', border: '1.5px solid #f0ede8' }}>
      <p style={{ fontSize: 11, color: '#a8a29e', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>{icon}</span> {label.toUpperCase()}
      </p>
      <p style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.4, color: accent }}>{value}</p>
    </div>
  )
}

// ── SHARED STYLES & TOKENS ───────────────────────────────────
const S = {
  page: {
    fontFamily: "'Nunito', 'DM Sans', sans-serif",
    background: '#fffdf7',
    color: '#1c1917',
    lineHeight: 1.6,
    minHeight: '100vh',
    padding: '40px 5% 80px',
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    border: '1.5px solid #f3f4f6',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  tag: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#f0fdf4', color: '#15803d',
    padding: '7px 16px', borderRadius: 100,
    fontSize: 12, fontWeight: 800, letterSpacing: '0.04em',
    border: '1.5px solid #bbf7d0',
  },
}

const FONTS_AND_KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.45} }
  .fade-up { animation: fadeUp 0.6s ease both; }
  .d1{animation-delay:0.05s} .d2{animation-delay:0.15s} .d3{animation-delay:0.25s}
  .sk { background: #e7e5e4; border-radius: 8px; animation: shimmer 1.4s ease-in-out infinite; }
  .ev-card { background:#fff; border-radius:24px; border:1.5px solid #f3f4f6; box-shadow:0 4px 32px rgba(0,0,0,0.07); overflow:hidden; }
  .back-link { display:inline-flex; align-items:center; gap:6px; color:#15803d; text-decoration:none; font-size:14px; font-weight:700; margin-bottom:28px; transition:all 0.2s; }
  .back-link:hover { color:#166534; gap:8px; }
  .share-btn { position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.18); backdrop-filter:blur(8px); border:1.5px solid rgba(255,255,255,0.3); color:#fff; padding:7px 16px; border-radius:100px; font-size:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s; font-family:inherit; }
  .share-btn:hover { background:rgba(255,255,255,0.28); }
  .btn-main { background:#15803d; color:#fff; padding:14px 28px; border-radius:100px; font-size:14px; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:all 0.25s; box-shadow:0 6px 20px rgba(21,128,61,0.22); font-family:inherit; cursor:pointer; border:none; }
  .btn-main:hover { background:#166534; transform:translateY(-2px); box-shadow:0 12px 32px rgba(21,128,61,0.3); }
  .btn-secondary { background:#fff; color:#15803d; padding:14px 28px; border-radius:100px; font-size:14px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:8px; border:2px solid #bbf7d0; transition:all 0.25s; font-family:inherit; cursor:pointer; }
  .btn-secondary:hover { border-color:#15803d; background:#f0fdf4; transform:translateY(-2px); }
  .quick-link { display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:16px; text-decoration:none; border:1.5px solid; transition:all 0.2s; }
  .quick-link:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.07); }
  ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#fffdf7} ::-webkit-scrollbar-thumb{background:#d6d3d1;border-radius:3px}
`