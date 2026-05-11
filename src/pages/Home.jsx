import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { isLoggedIn, logout } = useAuth()
  const loggedIn = isLoggedIn()
  const [count, setCount] = useState({ complaints: 0, resolved: 0, teams: 0, cities: 0 })
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const targets = { complaints: 500, resolved: 350, teams: 20, cities: 10 }
    const steps = 80; let step = 0
    const timer = setInterval(() => {
      step++
      const ease = 1 - Math.pow(1 - step / steps, 3)
      setCount({ complaints: Math.floor(targets.complaints * ease), resolved: Math.floor(targets.resolved * ease), teams: Math.floor(targets.teams * ease), cities: Math.floor(targets.cities * ease) })
      if (step >= steps) clearInterval(timer)
    }, 2500 / steps)

    const stepTimer = setInterval(() => setActiveStep(s => (s + 1) % 3), 3000)
    return () => { clearInterval(timer); clearInterval(stepTimer) }
  }, [])

  const STEPS = [
    { icon: '📸', title: 'Snap & Report', body: 'Take a photo, drop a pin, describe the issue. Done in under 30 seconds.', color: '#fef3c7', accent: '#d97706' },
    { icon: '🤖', title: 'AI Makes a Plan', body: 'GPT-4o writes a 5-step fix. DALL·E 3 shows you what clean looks like.', color: '#dcfce7', accent: '#15803d' },
    { icon: '✅', title: 'Track to Done', body: 'Follow every update. From assigned → in progress → resolved.', color: '#dbeafe', accent: '#1d4ed8' },
  ]

  const FEATURES = [
    { icon: '🤖', title: 'GPT-4o Plans', desc: 'Smart 5-step cleaning plans generated in seconds.', bg: '#fef9ee' },
    { icon: '🎨', title: 'Visual Clean Preview', desc: 'DALL·E 3 shows you the clean future of any dirty spot.', bg: '#f0fdf4' },
    { icon: '📍', title: 'Area Tagging', desc: 'Precise location tags for accurate team routing.', bg: '#eff6ff' },
    { icon: '👥', title: 'Team Dispatch', desc: 'One-click team assignment for admins.', bg: '#fdf4ff' },
    { icon: '📊', title: 'Live Tracking', desc: 'Every status change, visible in real time.', bg: '#fff7ed' },
    { icon: '🗓️', title: 'Community Events', desc: 'Find local drives and cleanliness events near you.', bg: '#f0fdfa' },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div style={{ fontFamily: "'Nunito', 'DM Sans', sans-serif", background: '#fffdf7', color: '#1c1917', lineHeight: 1.6 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fraunces { font-family: 'Fraunces', serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce-slow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.3); opacity: 0; } }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .d1{animation-delay:0.05s} .d2{animation-delay:0.15s} .d3{animation-delay:0.25s} .d4{animation-delay:0.35s}
        .btn-main { background: #15803d; color: #fff; padding: 16px 36px; border-radius: 100px; font-size: 16px; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.25s; box-shadow: 0 8px 24px rgba(21,128,61,0.25); }
        .btn-main:hover { background: #166534; transform: translateY(-3px); box-shadow: 0 16px 40px rgba(21,128,61,0.35); }
        .btn-secondary { background: #fff; color: #15803d; padding: 16px 36px; border-radius: 100px; font-size: 16px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; border: 2px solid #bbf7d0; transition: all 0.25s; }
        .btn-secondary:hover { border-color: #15803d; background: #f0fdf4; transform: translateY(-3px); }
        .card { background: #fff; border-radius: 24px; transition: all 0.3s ease; }
        .card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        .nav-link { color: #78716c; font-size: 15px; text-decoration: none; font-weight: 600; transition: color 0.2s; }
        .nav-link:hover { color: #15803d; }
        .tag { display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; color: #15803d; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; letter-spacing: 0.04em; border: 1.5px solid #bbf7d0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #fffdf7; } ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
      `}</style>



      {/* HERO */}
      <section style={{ padding: '80px 5% 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Blob backgrounds */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(187,247,208,0.4) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(254,243,199,0.6) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="fade-up d1 tag" style={{ marginBottom: 32, width: 'fit-content' }}>
                <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', position: 'relative', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', inset: -2, background: '#22c55e', borderRadius: '50%', opacity: 0.4, animation: 'pulse-ring 1.5s ease-out infinite' }} />
                </span>
                Live in 10+ Cities · AI-Powered 🤖
              </div>

              <h1 className="fraunces fade-up d2" style={{ fontSize: 'clamp(52px,7vw,88px)', lineHeight: 1.0, marginBottom: 24, letterSpacing: '-0.02em', color: '#1c1917' }}>
                A Cleaner City<br />
                <span style={{ color: '#15803d', fontStyle: 'italic' }}>Starts With</span><br />
                Your Photo.
              </h1>

              <p className="fade-up d3" style={{ fontSize: 18, lineHeight: 1.8, color: '#78716c', maxWidth: 480, marginBottom: 40, fontWeight: 400 }}>
                Report dirty areas instantly. Our AI generates a cleaning plan and paints a picture of a cleaner tomorrow - while real teams get to work.
              </p>

              <div className="fade-up d4" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
                <a href={loggedIn ? '/complaints/new' : '/register'} className="btn-main">
                  <span>📸</span> {loggedIn ? 'Report an Issue' : 'Start for Free'}
                </a>
                <a href="/events" className="btn-secondary">
                  <span>🗓️</span> Browse Events
                </a>
              </div>

              {/* Mini stats */}
              <div className="fade-up" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', animationDelay: '0.5s' }}>
                {[
                  { n: count.complaints + '+', l: 'Reports filed' },
                  { n: count.resolved + '+', l: 'Resolved' },
                  { n: count.cities + '+', l: 'Cities' },
                ].map(s => (
                  <div key={s.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Fraunces', fontSize: 34, fontWeight: 900, color: '#15803d', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: 13, color: '#a8a29e', fontWeight: 600, marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating app card */}
            <div className="fade-up d3" style={{ position: 'relative' }}>
              {/* Floating badges */}
              <div style={{ position: 'absolute', top: -16, right: -16, background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #f3f4f6' }}>
                <span style={{ fontSize: 18 }}>🎨</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#1c1917', letterSpacing: '0.04em' }}>DALL·E 3</p>
                  <p style={{ fontSize: 10, color: '#a8a29e' }}>Vision ready</p>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: -16, left: -16, background: '#15803d', borderRadius: 16, padding: '12px 18px', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%', animation: 'bounce-slow 2s infinite', display: 'inline-block' }} />
                <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Team Assigned!</p>
              </div>

              <div className="card" style={{ padding: 28, boxShadow: '0 20px 80px rgba(0,0,0,0.1)', border: '1.5px solid #f3f4f6' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', borderRadius: 16, padding: '24px 20px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.3)', borderRadius: '50%' }} />
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#15803d', letterSpacing: '0.08em', marginBottom: 6 }}>COMPLAINT #4821</p>
                  <p style={{ fontWeight: 700, color: '#1c1917', fontSize: 15, marginBottom: 12 }}>Sector 14, Dwarka — Delhi</p>
                  <span style={{ background: '#fbbf24', color: '#78350f', fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 100 }}>IN PROGRESS</span>
                </div>

                <p style={{ fontSize: 12, fontWeight: 800, color: '#a8a29e', letterSpacing: '0.08em', marginBottom: 14 }}>🤖 AI CLEANING PLAN</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { t: 'Deploy waste collection team', done: true },
                    { t: 'Remove large debris & litter', done: true },
                    { t: 'Deep clean & disinfect area', done: false },
                    { t: 'Install dustbins & signage', done: false },
                    { t: 'Schedule weekly monitoring', done: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: s.done ? '#f0fdf4' : '#fafaf8', border: `1.5px solid ${s.done ? '#bbf7d0' : '#f3f4f6'}` }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: s.done ? '#15803d' : '#e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: s.done ? '#fff' : '#a8a29e', fontWeight: 800, flexShrink: 0 }}>
                        {s.done ? '✓' : i + 1}
                      </span>
                      <span style={{ fontSize: 13, color: s.done ? '#15803d' : '#78716c', textDecoration: s.done ? 'line-through' : 'none', fontWeight: s.done ? 600 : 400 }}>{s.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div style={{ background: '#f5f5f4', padding: '20px 5%', borderTop: '1.5px solid #e7e5e4', borderBottom: '1.5px solid #e7e5e4' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {['🌿 Eco Friendly', '🤖 AI Powered', '🇮🇳 Made for India', '⚡ Live Tracking', '🔒 Secure & Private', '✅ 350+ Resolved'].map(b => (
            <span key={b} style={{ fontSize: 13, fontWeight: 700, color: '#78716c', display: 'flex', alignItems: 'center', gap: 6 }}>{b}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS — Interactive */}
      <section style={{ padding: '100px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>✦ Simple Process</span>
            <h2 className="fraunces" style={{ fontSize: 'clamp(36px,5vw,60px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Three steps,<br /><span style={{ color: '#15803d', fontStyle: 'italic' }}>real results.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} className="card" onClick={() => setActiveStep(i)}
                style={{ padding: '40px 36px', cursor: 'pointer', border: `2px solid ${activeStep === i ? s.accent : '#f3f4f6'}`, background: activeStep === i ? s.color : '#fff', transition: 'all 0.3s ease' }}>
                <div style={{ width: 52, height: 52, background: activeStep === i ? s.accent : '#f5f5f4', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 24, transition: 'all 0.3s' }}>
                  {activeStep === i ? s.icon : s.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: activeStep === i ? s.accent : '#a8a29e', letterSpacing: '0.1em', marginBottom: 10 }}>STEP {String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ fontFamily: 'Fraunces', fontSize: 24, fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em', color: activeStep === i ? '#1c1917' : '#44403c' }}>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#78716c', fontWeight: 400 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 5%', background: '#fffdf7' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>✦ Features</span>
              <h2 className="fraunces" style={{ fontSize: 'clamp(36px,5vw,60px)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                Built for<br /><span style={{ color: '#15803d', fontStyle: 'italic' }}>real impact.</span>
              </h2>
            </div>
            <p style={{ fontSize: 16, color: '#78716c', maxWidth: 300, lineHeight: 1.7, fontWeight: 400 }}>Powerful tools making civic cleanliness effortless for everyone.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card" style={{ padding: '32px 28px', background: f.bg, border: '1.5px solid transparent', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'transparent'; }}>
                <div style={{ fontSize: 32, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Fraunces', fontSize: 22, fontWeight: 900, marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: '#78716c' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section style={{ padding: '80px 5%', background: '#15803d' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { n: count.complaints + '+', l: 'Complaints Raised', icon: '📝' },
              { n: count.resolved + '+', l: 'Areas Resolved', icon: '✅' },
              { n: count.teams + '+', l: 'Active Teams', icon: '👥' },
              { n: count.cities + '+', l: 'Cities Covered', icon: '🏙️' },
            ].map((s, i) => (
              <div key={s.l} style={{ textAlign: 'center', padding: '20px 0', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                <div style={{ fontSize: 20, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Fraunces', fontSize: 'clamp(40px,4vw,64px)', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '100px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>★ Reviews</span>
            <h2 className="fraunces" style={{ fontSize: 'clamp(36px,5vw,60px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Citizens love<br /><span style={{ color: '#15803d', fontStyle: 'italic' }}>SwachhSetu</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { name: 'Priya Sharma', city: 'Delhi', text: 'Reported a garbage dump near my colony. Within 3 days the team cleaned it up. The AI cleaning plan was spot on!', avatar: 'P', color: '#fce7f3' },
              { name: 'Rahul Verma', city: 'Mumbai', text: 'The DALL·E clean image was incredible — it showed exactly how our street could look. Motivated our whole neighborhood!', avatar: 'R', color: '#dbeafe' },
              { name: 'Anjali Singh', city: 'Lucknow', text: 'Raised 5 complaints, all resolved within a week. Finally civic tech that actually works!', avatar: 'A', color: '#dcfce7' },
            ].map(t => (
              <div key={t.name} className="card" style={{ padding: '36px 32px', border: '1.5px solid #f3f4f6' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: 16 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: '#57534e', marginBottom: 28, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 24, borderTop: '1.5px solid #f3f4f6' }}>
                  <div style={{ width: 48, height: 48, background: t.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 18, color: '#1c1917' }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, color: '#1c1917' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: '#a8a29e', fontWeight: 600 }}>📍 {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 5% 100px', background: '#fffdf7' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 50%, #fef9c3 100%)', borderRadius: 32, padding: 'clamp(48px,6vw,80px)', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '2px solid #bbf7d0' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -30, width: 260, height: 260, background: 'rgba(255,255,255,0.3)', borderRadius: '50%' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 64, marginBottom: 24, animation: 'bounce-slow 3s ease-in-out infinite' }}>🌿</div>
              <h2 className="fraunces" style={{ fontSize: 'clamp(40px,5vw,72px)', color: '#1c1917', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 20 }}>
                Ready to make a<br /><span style={{ color: '#15803d', fontStyle: 'italic' }}>difference?</span>
              </h2>
              <p style={{ fontSize: 17, color: '#78716c', maxWidth: 440, margin: '0 auto 44px', lineHeight: 1.75 }}>
                Join thousands of citizens making India cleaner every single day. Free for everyone.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {loggedIn ? (
                  <>
                    <a href="/profile" className="btn-main" style={{ fontSize: 18, padding: '18px 48px' }}>
                      👤 Profile
                    </a>
                    <button type="button" onClick={handleLogout} className="btn-secondary" style={{ fontSize: 18, padding: '18px 48px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/register" className="btn-main" style={{ fontSize: 18, padding: '18px 48px' }}>
                      🚀 Get Started Free
                    </a>
                    <a href="/login" className="btn-secondary" style={{ fontSize: 18, padding: '18px 48px' }}>
                      🔑 Login
                    </a>
                  </>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 28, fontWeight: 700 }}>Free forever for citizens · No credit card required · 🇮🇳 Made for India</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      {/* <footer style={{ padding: '40px 5%', borderTop: '1.5px solid #e7e5e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #15803d, #059669)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
          <span style={{ fontFamily: 'Fraunces', fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>SwachhSetu</span>
        </div>
        <p style={{ fontSize: 13, color: '#a8a29e', fontWeight: 600 }}>© 2025 SwachhSetu · Making India Cleaner 🇮🇳</p>
      </footer> */}
    </div>
  )
}