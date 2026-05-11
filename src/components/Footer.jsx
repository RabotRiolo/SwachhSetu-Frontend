import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ fontFamily: "'Nunito', 'DM Sans', sans-serif", background: '#1c1917', color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes bounce-slow {
          0%,100% { transform: translateY(0);    }
          50%      { transform: translateY(-6px); }
        }

        .ft-logo-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #15803d, #059669);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 18px rgba(21,128,61,0.4);
          transition: transform 0.25s, box-shadow 0.25s;
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .ft-logo:hover .ft-logo-icon { transform: scale(1.1) rotate(-3deg); }

        .ft-link {
          color: #a8a29e;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
          display: block;
          padding: 3px 0;
        }
        .ft-link:hover { color: #fff; }

        .ft-step {
          color: #78716c;
          font-size: 14px;
          font-weight: 600;
          padding: 3px 0;
          display: flex; align-items: center; gap: 8px;
        }

        .ft-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #15803d; color: #fff;
          padding: 12px 24px; border-radius: 100px;
          font-size: 14px; font-weight: 800;
          text-decoration: none;
          box-shadow: 0 4px 18px rgba(21,128,61,0.35);
          transition: all 0.25s;
          margin-top: 6px;
        }
        .ft-cta:hover { background: #166534; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(21,128,61,0.45); }

        .ft-divider { height: 1.5px; background: rgba(255,255,255,0.07); }

        .ft-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.1);
          padding: 7px 14px; border-radius: 100px;
          font-size: 12px; font-weight: 700;
          color: #a8a29e;
        }

        .ft-bottom-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700; color: #78716c;
        }
        .ft-bottom-badge span { color: #a8a29e; }
      `}</style>

      {/* ── MAIN FOOTER ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 5% 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48 }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" className="ft-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 20, width: 'fit-content' }}>
              <div className="ft-logo-icon">🌿</div>
              <div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1 }}>SwachhSetu</div>
                <div style={{ fontSize: 11, color: '#78716c', fontWeight: 700, marginTop: 2 }}>Clean India Initiative</div>
              </div>
            </Link>

            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#78716c', marginBottom: 24, maxWidth: 260 }}>
              AI-powered civic cleanliness platform. Report dirty areas, get instant cleaning plans, and track resolution in real time.
            </p>

            {/* AI badge */}
            <div className="ft-badge">
              <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', flexShrink: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', inset: -2, background: '#22c55e', borderRadius: '50%', opacity: 0.4, animation: 'pulse-ring 1.5s ease-out infinite' }} />
              </span>
              Powered by GPT-4o + DALL·E 3
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em', marginBottom: 20 }}>
              Quick Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { to: '/',               label: '🏠 Home'         },
                { to: '/events',         label: '🗓️ Events'       },
                { to: '/articles',       label: '📰 Articles'     },
                { to: '/dashboard',      label: '📊 Dashboard'    },
                { to: '/complaints/new', label: '📸 Report Issue' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="ft-link">{link.label}</Link>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em', marginBottom: 20 }}>
              How It Works
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { icon: '📸', text: 'Upload a photo'           },
                { icon: '🤖', text: 'AI generates plan'        },
                { icon: '🎨', text: 'See clean area vision'    },
                { icon: '👥', text: 'Team gets assigned'       },
                { icon: '✅', text: 'Track to resolution'      },
              ].map((step, i) => (
                <div key={i} className="ft-step">
                  <span style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{step.icon}</span>
                  {step.text}
                </div>
              ))}
            </div>
          </div>

          {/* Get Involved */}
          <div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em', marginBottom: 20 }}>
              Get Involved
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
              {[
                { to: '/register',       label: '🚀 Register Free'     },
                { to: '/login',          label: '🔑 Login'             },
                { to: '/complaints/new', label: '📸 Report Dirty Area' },
                { to: '/events',         label: '🤝 Join a Drive'      },
              ].map(link => (
                <Link key={link.to} to={link.to} className="ft-link">{link.label}</Link>
              ))}
            </div>
            <Link to="/register" className="ft-cta">
              🌿 Join Now — It's Free
            </Link>
          </div>

        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="ft-divider" />

      {/* ── BOTTOM BAR ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 13, color: '#57534e', fontWeight: 600 }}>
          © {year} SwachhSetu · Made with 💚 for a cleaner India.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {['🇮🇳 Swachh Bharat', '🤖 AI Powered', '🌿 Eco Friendly'].map((b, i) => (
            <span key={b} className="ft-bottom-badge">{b}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}