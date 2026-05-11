import { Link } from 'react-router-dom'
import resolveAssetUrl from '../utils/resolveAssetUrl'

function getDaysLeft(dateStr) {
  const t = new Date(dateStr).getTime()
  if (Number.isNaN(t)) return null
  const diff = Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0)   return { label: 'Completed',        bg: '#f5f5f4', color: '#78716c', border: '#e7e5e4' }
  if (diff === 0) return { label: 'Today!',            bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }
  if (diff === 1) return { label: 'Tomorrow',          bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }
  if (diff <= 7)  return { label: `${diff} days left`, bg: '#fff7ed', color: '#c2410c', border: '#fdba74' }
  return               { label: `${diff} days away`,  bg: '#f5f5f4', color: '#78716c', border: '#e7e5e4' }
}

export default function EventCard({ event }) {
  if (!event) return null

  const isPast    = event.eventDate && new Date(event.eventDate) < new Date()
  const countdown = event.eventDate ? getDaysLeft(event.eventDate) : null
  const heroImg = resolveAssetUrl(event.imageUrl)

  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
    : null

  const formattedTime = event.eventDate
    ? new Date(event.eventDate).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
    : null

  return (
    <>
      <style>{`
        .ec-card {
          display: block; text-decoration: none; color: inherit;
          background: #fff; border-radius: 24px; border: 1.5px solid #f0ede8;
          overflow: hidden; transition: all 0.25s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .ec-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          border-color: #bbf7d0;
        }
        .ec-card:hover .ec-img { transform: scale(1.06); }
        .ec-card:hover .ec-title { color: #15803d; }
        .ec-card:hover .ec-arrow { transform: translateX(4px); }

        .ec-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .ec-title {
          font-family: 'Fraunces', serif; font-weight: 900;
          font-size: 17px; letter-spacing: -0.01em; line-height: 1.25;
          color: #1c1917; margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          transition: color 0.2s;
        }
        .ec-arrow {
          font-size: 13px; font-weight: 800; color: #15803d;
          transition: transform 0.2s; display: inline-block;
        }
      `}</style>

      <Link to={`/events/${event.id}`} className="ec-card" style={ isPast ? { opacity: 0.78 } : {} }>

        {/* Cover image */}
        <div style={{ position:'relative', height:192, background:'linear-gradient(135deg,#15803d,#059669)', overflow:'hidden' }}>
          {heroImg ? (
            <img src={heroImg} alt={event.title} className="ec-img"
              style={ isPast ? { filter:'grayscale(0.5)' } : {} } />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', opacity:0.25 }}>
              <span style={{ fontSize:72 }}>🌿</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />

          {/* Countdown badge */}
          {countdown && (
            <div style={{
              position:'absolute', top:12, left:12,
              padding:'5px 12px', borderRadius:100, fontSize:11, fontWeight:800,
              backdropFilter:'blur(8px)',
              background: isPast ? 'rgba(28,25,23,0.6)' : 'rgba(255,255,255,0.9)',
              color: isPast ? '#e7e5e4' : countdown.color,
              border: isPast ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${countdown.border}`,
            }}>
              {isPast ? '✓ Completed' : `⏰ ${countdown.label}`}
            </div>
          )}

          {/* Upcoming pill bottom-right */}
          {!isPast && (
            <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:100, padding:'4px 10px', fontSize:11, fontWeight:800, color:'#fff' }}>
              🔜 Upcoming
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding:'20px 22px 22px' }}>
          <h3 className="ec-title">{event.title}</h3>

          {event.description && (
            <p style={{ fontSize:13, color:'#78716c', lineHeight:1.65, marginBottom:14, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
              {event.description}
            </p>
          )}

          {/* Meta */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
            {formattedDate && (
              <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#a8a29e', fontWeight:600 }}>
                <span>📅</span>
                <span>{formattedDate}{formattedTime && <span style={{ color:'#d6d3d1' }}> · {formattedTime}</span>}</span>
              </div>
            )}
            {event.location && (
              <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#a8a29e', fontWeight:600 }}>
                <span>📍</span>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{event.location}</span>
              </div>
            )}
          </div>

          {/* Footer row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:'1.5px solid #f5f5f4' }}>
            <span style={{
              fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:100,
              background: isPast ? '#f5f5f4' : '#f0fdf4',
              color:      isPast ? '#a8a29e' : '#15803d',
              border:     isPast ? '1px solid #e7e5e4' : '1px solid #bbf7d0',
            }}>
              {isPast ? '✓ Past Event' : '🔜 Upcoming'}
            </span>
            <span className="ec-arrow">Details →</span>
          </div>
        </div>
      </Link>
    </>
  )
}