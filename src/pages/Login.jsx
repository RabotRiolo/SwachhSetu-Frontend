import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [form, setForm]         = useState({ email: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const from = location.state?.from?.pathname || null

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim())    { setError('Email is required');    return }
    if (!form.password.trim()) { setError('Password is required'); return }
    setLoading(true)
    try {
      const userData = await login(form);
      const redirect = from || (userData.role === 'ADMIN' ? '/admin' : '/')
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        'Invalid email or password. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Nunito', 'DM Sans', sans-serif", minHeight: '100vh', background: '#fffdf7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-ring { 0% { transform:scale(0.9); opacity:0.8; } 100% { transform:scale(1.4); opacity:0; } }
        @keyframes spin     { to { transform:rotate(360deg); } }

        .lg-fade { animation: fadeUp 0.6s ease both; }
        .lg-d1   { animation-delay: 0.05s; }
        .lg-d2   { animation-delay: 0.15s; }
        .lg-d3   { animation-delay: 0.25s; }
        .lg-d4   { animation-delay: 0.35s; }

        .lg-input {
          width: 100%; border: 1.5px solid #e7e5e4;
          border-radius: 14px; padding: 13px 16px 13px 44px;
          font-size: 14px; font-family: inherit; font-weight: 600;
          color: #1c1917; background: #fafaf8;
          outline: none; transition: all 0.2s;
        }
        .lg-input::placeholder { color: #a8a29e; font-weight: 500; }
        .lg-input:focus { border-color: #15803d; background: #fff; box-shadow: 0 0 0 4px rgba(21,128,61,0.08); }
        .lg-input.error { border-color: #fca5a5; background: #fff5f5; }
        .lg-input:disabled { opacity: 0.6; cursor: not-allowed; }

        .lg-btn {
          width: 100%; background: #15803d; color: #fff;
          border: none; border-radius: 100px;
          padding: 15px; font-size: 15px; font-weight: 800;
          font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(21,128,61,0.25);
          transition: all 0.25s;
        }
        .lg-btn:hover:not(:disabled) { background: #166534; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(21,128,61,0.35); }
        .lg-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .lg-spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .lg-label { display: block; font-size: 13px; font-weight: 800; color: #1c1917; margin-bottom: 8px; letter-spacing: 0.01em; }

        .lg-demo {
          background: #fff; border: 1.5px solid #fef3c7;
          border-radius: 20px; padding: 20px 24px;
          margin-top: 16px;
        }
      `}</style>

      {/* Blob BGs */}
      <div style={{ position:'fixed', top:-120, right:-100, width:480, height:480, background:'radial-gradient(circle, rgba(187,247,208,0.35) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:-100, left:-80, width:380, height:380, background:'radial-gradient(circle, rgba(254,243,199,0.5) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:440, position:'relative' }}>

        {/* Card */}
        <div className="lg-fade lg-d1" style={{ background:'#fff', borderRadius:28, border:'1.5px solid #f0ede8', boxShadow:'0 24px 80px rgba(0,0,0,0.08)', overflow:'hidden' }}>

          {/* Top accent bar */}
          <div style={{ height:4, background:'linear-gradient(90deg, #15803d, #059669, #d97706)', borderRadius:'0' }} />

          <div style={{ padding:'36px 36px 32px' }}>

            {/* Logo + heading */}
            <div className="lg-fade lg-d1" style={{ textAlign:'center', marginBottom:32 }}>
              <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:20 }}>
                <div style={{ width:44, height:44, background:'linear-gradient(135deg,#15803d,#059669)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:'0 4px 14px rgba(21,128,61,0.3)', transition:'transform 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1) rotate(-3deg)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}
                >🌿</div>
                <span style={{ fontFamily:'Fraunces,serif', fontSize:24, fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917' }}>SwachhSetu</span>
              </Link>

              {/* Live tag */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:100, padding:'6px 14px', marginBottom:20 }}>
                <span style={{ width:8, height:8, background:'#22c55e', borderRadius:'50%', flexShrink:0, position:'relative', display:'inline-block' }}>
                  <span style={{ position:'absolute', inset:-2, background:'#22c55e', borderRadius:'50%', opacity:0.4, animation:'pulse-ring 1.5s ease-out infinite' }} />
                </span>
                <span style={{ fontSize:12, fontWeight:800, color:'#15803d', letterSpacing:'0.04em' }}>Welcome Back</span>
              </div>

              <h1 style={{ fontFamily:'Fraunces,serif', fontSize:32, fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917', lineHeight:1.1, marginBottom:8 }}>
                Login to your<br /><span style={{ color:'#15803d', fontStyle:'italic' }}>account</span>
              </h1>
              <p style={{ fontSize:14, color:'#78716c', fontWeight:500 }}>Continue making India cleaner 🇮🇳</p>
            </div>

            {/* Error */}
            {error && (
              <div className="lg-fade" style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#fff5f5', border:'1.5px solid #fca5a5', borderRadius:14, padding:'14px 16px', marginBottom:24 }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <p style={{ fontSize:13, color:'#dc2626', fontWeight:600, lineHeight:1.5 }}>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Email */}
              <div className="lg-fade lg-d2">
                <label htmlFor="email" className="lg-label">Email Address</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, pointerEvents:'none' }}>📧</span>
                  <input
                    id="email" type="email" name="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email" required disabled={loading}
                    className={`lg-input${error && !form.email ? ' error' : ''}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lg-fade lg-d3">
                <label htmlFor="password" className="lg-label">Password</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, pointerEvents:'none' }}>🔒</span>
                  <input
                    id="password" name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password" required disabled={loading}
                    className={`lg-input${error && !form.password ? ' error' : ''}`}
                    style={{ paddingRight:44 }}
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowPass(p => !p)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#a8a29e', padding:4, transition:'color 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#78716c'}
                    onMouseLeave={e=>e.currentTarget.style.color='#a8a29e'}
                  >{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>

              {/* Submit */}
              <div className="lg-fade lg-d4">
                <button type="submit" disabled={loading} className="lg-btn">
                  {loading ? (
                    <><div className="lg-spinner" /><span>Logging in...</span></>
                  ) : (
                    <><span>🔑</span><span>Login to SwachhSetu</span></>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
              <div style={{ flex:1, height:1.5, background:'#f0ede8' }} />
              <span style={{ fontSize:12, color:'#a8a29e', fontWeight:700 }}>OR</span>
              <div style={{ flex:1, height:1.5, background:'#f0ede8' }} />
            </div>

            {/* Register link */}
            <p style={{ textAlign:'center', fontSize:14, color:'#78716c' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color:'#15803d', fontWeight:800, textDecoration:'none', borderBottom:'2px solid #bbf7d0', paddingBottom:1, transition:'border-color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#15803d'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#bbf7d0'}
              >Register for free →</Link>
            </p>

          </div>
        </div>

        {/* Demo hint */}
        {/* <div className="lg-demo lg-fade" style={{ animationDelay:'0.45s' }}>
          <p style={{ fontSize:13, fontWeight:800, color:'#d97706', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
            <span>💡</span> Demo Setup
          </p>
          <ol style={{ paddingLeft:16, display:'flex', flexDirection:'column', gap:6 }}>
            {[
              'Register a new account below',
              <>Run in MySQL: <code style={{ background:'#fef3c7', border:'1px solid #fde68a', padding:'2px 8px', borderRadius:6, fontFamily:'monospace', fontSize:11, color:'#92400e' }}>UPDATE users SET role='ADMIN' WHERE email='your@email.com';</code></>,
              'Login again to access Admin Panel',
            ].map((step, i) => (
              <li key={i} style={{ fontSize:13, color:'#78350f', fontWeight:600, lineHeight:1.6 }}>{step}</li>
            ))}
          </ol>
        </div> */}

        {/* Back to home */}
        <div style={{ textAlign:'center', marginTop:20 }}>
          <Link to="/" style={{ fontSize:13, color:'#a8a29e', textDecoration:'none', fontWeight:700, display:'inline-flex', alignItems:'center', gap:6, transition:'color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#15803d'}
            onMouseLeave={e=>e.currentTarget.style.color='#a8a29e'}
          >← Back to Home</Link>
        </div>

      </div>
    </div>
  )
}