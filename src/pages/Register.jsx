import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function getPasswordStrength(password) {
  if (!password || password.length === 0) return { level: 0, label: '', color: '', hex: '' }
  if (password.length < 6)  return { level: 1, label: 'Too short',  hex: '#f87171' }
  if (password.length < 8)  return { level: 2, label: 'Weak',       hex: '#fb923c' }
  if (password.length < 12) return { level: 3, label: 'Medium',     hex: '#d97706' }
  return                            { level: 4, label: 'Strong 💪',  hex: '#15803d' }
}

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm]               = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError]             = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading]         = useState(false)
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed]           = useState(false)

  const strength = getPasswordStrength(form.password)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (error) setError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())                           errs.name            = 'Full name is required'
    else if (form.name.trim().length < 2)            errs.name            = 'Name must be at least 2 characters'
    if (!form.email.trim())                          errs.email           = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))      errs.email           = 'Enter a valid email address'
    if (!form.password)                              errs.password        = 'Password is required'
    else if (form.password.length < 6)               errs.password        = 'Password must be at least 6 characters'
    if (!form.confirmPassword)                       errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!agreed)                                     errs.agreed          = 'You must accept the terms to continue'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }
    setLoading(true); setError('')
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (hasError, isValid) => ({
    width: '100%', border: `1.5px solid ${hasError ? '#fca5a5' : isValid ? '#86efac' : '#e7e5e4'}`,
    borderRadius: 14, padding: '13px 16px 13px 44px',
    fontSize: 14, fontFamily: 'inherit', fontWeight: 600,
    color: '#1c1917', background: hasError ? '#fff5f5' : isValid ? '#f0fdf4' : '#fafaf8',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  })

  return (
    <div style={{ fontFamily: "'Nunito','DM Sans',sans-serif", minHeight: '100vh', background: '#fffdf7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-ring{ 0% { transform:scale(0.9); opacity:0.8; } 100% { transform:scale(1.4); opacity:0; } }
        @keyframes spin      { to { transform:rotate(360deg); } }
        .rg-fade { animation: fadeUp 0.6s ease both; }
        .rg-d1{animation-delay:0.05s} .rg-d2{animation-delay:0.12s} .rg-d3{animation-delay:0.19s}
        .rg-d4{animation-delay:0.26s} .rg-d5{animation-delay:0.33s} .rg-d6{animation-delay:0.4s}

        .rg-input-wrap { position:relative; }
        .rg-input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; }
        .rg-input:focus { border-color:#15803d !important; background:#fff !important; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .rg-input:disabled { opacity:0.6; cursor:not-allowed; }
        .rg-input::placeholder { color:#a8a29e; font-weight:500; }

        .rg-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; color:#a8a29e; padding:4px; transition:color 0.2s; }
        .rg-eye:hover { color:#78716c; }

        .rg-label { display:block; font-size:13px; font-weight:800; color:#1c1917; margin-bottom:8px; letter-spacing:0.01em; }
        .rg-field-err { font-size:12px; color:#ef4444; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:5px; }

        .rg-btn { width:100%; background:#15803d; color:#fff; border:none; border-radius:100px; padding:15px; font-size:15px; font-weight:800; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 8px 24px rgba(21,128,61,0.25); transition:all 0.25s; }
        .rg-btn:hover:not(:disabled) { background:#166534; transform:translateY(-2px); box-shadow:0 12px 32px rgba(21,128,61,0.35); }
        .rg-btn:disabled { opacity:0.65; cursor:not-allowed; transform:none; }
        .rg-spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }

        .rg-check-box { width:22px; height:22px; border-radius:8px; border:2px solid #e7e5e4; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; cursor:pointer; margin-top:1px; }
        .rg-check-box.checked { background:#15803d; border-color:#15803d; }
        .rg-check-box.err { border-color:#fca5a5; background:#fff5f5; }
        .rg-check-box:hover:not(.checked) { border-color:#86efac; }

        .rg-benefits-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.08); font-size:13px; font-weight:600; color:rgba(255,255,255,0.85); }
      `}</style>

      {/* Blob BGs */}
      <div style={{ position:'fixed', top:-120, right:-100, width:480, height:480, background:'radial-gradient(circle,rgba(187,247,208,0.35) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:-100, left:-80, width:380, height:380, background:'radial-gradient(circle,rgba(254,243,199,0.5) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:460, position:'relative' }}>

        {/* Card */}
        <div className="rg-fade rg-d1" style={{ background:'#fff', borderRadius:28, border:'1.5px solid #f0ede8', boxShadow:'0 24px 80px rgba(0,0,0,0.08)', overflow:'hidden' }}>

          {/* Top accent bar */}
          <div style={{ height:4, background:'linear-gradient(90deg,#15803d,#059669,#d97706)' }} />

          <div style={{ padding:'36px 36px 32px' }}>

            {/* Logo + heading */}
            <div className="rg-fade rg-d1" style={{ textAlign:'center', marginBottom:28 }}>
              <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:16 }}>
                <div style={{ width:44, height:44, background:'linear-gradient(135deg,#15803d,#059669)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:'0 4px 14px rgba(21,128,61,0.3)', transition:'transform 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1) rotate(-3deg)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}
                >🌿</div>
                <span style={{ fontFamily:'Fraunces,serif', fontSize:24, fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917' }}>SwachhSetu</span>
              </Link>

              {/* Live tag */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:100, padding:'6px 14px', marginBottom:16 }}>
                <span style={{ width:8, height:8, background:'#22c55e', borderRadius:'50%', flexShrink:0, position:'relative', display:'inline-block' }}>
                  <span style={{ position:'absolute', inset:-2, background:'#22c55e', borderRadius:'50%', opacity:0.4, animation:'pulse-ring 1.5s ease-out infinite' }} />
                </span>
                <span style={{ fontSize:12, fontWeight:800, color:'#15803d', letterSpacing:'0.04em' }}>Join 500+ Citizens 🇮🇳</span>
              </div>

              <h1 style={{ fontFamily:'Fraunces,serif', fontSize:32, fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917', lineHeight:1.1, marginBottom:8 }}>
                Create your<br /><span style={{ color:'#15803d', fontStyle:'italic' }}>free account</span>
              </h1>
              <p style={{ fontSize:14, color:'#78716c', fontWeight:500 }}>Join the clean India movement today</p>
            </div>

            {/* Global error */}
            {error && (
              <div className="rg-fade" style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#fff5f5', border:'1.5px solid #fca5a5', borderRadius:14, padding:'14px 16px', marginBottom:24 }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <p style={{ fontSize:13, color:'#dc2626', fontWeight:600, lineHeight:1.5 }}>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* Full Name */}
              <div className="rg-fade rg-d2">
                <label htmlFor="name" className="rg-label">Full Name</label>
                <div className="rg-input-wrap">
                  <span className="rg-input-icon">👤</span>
                  <input id="name" type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Raman Kumar" autoComplete="name" disabled={loading}
                    className="rg-input" style={inputStyle(!!fieldErrors.name, false)} />
                </div>
                {fieldErrors.name && <p className="rg-field-err">⚠ {fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div className="rg-fade rg-d3">
                <label htmlFor="email" className="rg-label">Email Address</label>
                <div className="rg-input-wrap">
                  <span className="rg-input-icon">📧</span>
                  <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com" autoComplete="email" disabled={loading}
                    className="rg-input" style={inputStyle(!!fieldErrors.email, false)} />
                </div>
                {fieldErrors.email && <p className="rg-field-err">⚠ {fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div className="rg-fade rg-d4">
                <label htmlFor="password" className="rg-label">Password</label>
                <div className="rg-input-wrap">
                  <span className="rg-input-icon">🔒</span>
                  <input id="password" name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handleChange}
                    placeholder="Min 6 characters" autoComplete="new-password" disabled={loading}
                    className="rg-input" style={{ ...inputStyle(!!fieldErrors.password, false), paddingRight: 44 }} />
                  <button type="button" className="rg-eye" tabIndex={-1} onClick={() => setShowPass(p => !p)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:'flex', gap:4, marginBottom:5 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ height:4, flex:1, borderRadius:100, background: i <= strength.level ? strength.hex : '#e7e5e4', transition:'background 0.3s' }} />
                      ))}
                    </div>
                    <p style={{ fontSize:12, fontWeight:700, color: strength.hex }}>{strength.label}</p>
                  </div>
                )}
                {fieldErrors.password && <p className="rg-field-err">⚠ {fieldErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="rg-fade rg-d5">
                <label htmlFor="confirmPassword" className="rg-label">Confirm Password</label>
                <div className="rg-input-wrap">
                  <span className="rg-input-icon">🔐</span>
                  <input id="confirmPassword" name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter your password" autoComplete="new-password" disabled={loading}
                    className="rg-input"
                    style={{ ...inputStyle(!!fieldErrors.confirmPassword, !!(form.confirmPassword && form.password === form.confirmPassword)), paddingRight: 44 }}
                  />
                  <button type="button" className="rg-eye" tabIndex={-1} onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <span style={{ position:'absolute', right:42, top:'50%', transform:'translateY(-50%)', color:'#15803d', fontWeight:800, fontSize:16 }}>✓</span>
                  )}
                </div>
                {fieldErrors.confirmPassword && <p className="rg-field-err">⚠ {fieldErrors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div className="rg-fade rg-d6">
                <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
                  <div
                    className={`rg-check-box ${agreed ? 'checked' : ''} ${fieldErrors.agreed ? 'err' : ''}`}
                    onClick={() => { setAgreed(a => !a); if (fieldErrors.agreed) setFieldErrors(p => ({ ...p, agreed: '' })) }}
                  >
                    {agreed && (
                      <svg width="13" height="13" fill="none" stroke="#fff" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" checked={agreed} onChange={() => {}} style={{ display:'none' }} />
                  <span style={{ fontSize:13, color:'#78716c', lineHeight:1.6, fontWeight:500 }}>
                    I agree to the{' '}
                    <span style={{ color:'#15803d', fontWeight:800, cursor:'pointer', borderBottom:'2px solid #bbf7d0' }}>Terms of Service</span>
                    {' '}and{' '}
                    <span style={{ color:'#15803d', fontWeight:800, cursor:'pointer', borderBottom:'2px solid #bbf7d0' }}>Privacy Policy</span>
                    {' '}and commit to helping make India cleaner 🌿
                  </span>
                </label>
                {fieldErrors.agreed && <p className="rg-field-err" style={{ marginLeft:34 }}>⚠ {fieldErrors.agreed}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="rg-btn">
                {loading
                  ? <><div className="rg-spinner" /><span>Creating account...</span></>
                  : <><span>✨</span><span>Create Free Account</span></>
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
              <div style={{ flex:1, height:1.5, background:'#f0ede8' }} />
              <span style={{ fontSize:12, color:'#a8a29e', fontWeight:700 }}>OR</span>
              <div style={{ flex:1, height:1.5, background:'#f0ede8' }} />
            </div>

            {/* Login link */}
            <p style={{ textAlign:'center', fontSize:14, color:'#78716c' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'#15803d', fontWeight:800, textDecoration:'none', borderBottom:'2px solid #bbf7d0', paddingBottom:1 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#15803d'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#bbf7d0'}
              >Login →</Link>
            </p>
          </div>
        </div>

        {/* Benefits card */}
        <div className="rg-fade" style={{ animationDelay:'0.5s', marginTop:16, background:'#1c1917', borderRadius:24, padding:'24px 28px', border:'1.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:100, padding:'5px 12px', marginBottom:16 }}>
            <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.6)', letterSpacing:'0.08em' }}>✦ FREE FOREVER</span>
          </div>
          <p style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:900, color:'#fff', letterSpacing:'-0.01em', marginBottom:14 }}>
            What you get for <span style={{ color:'#4ade80', fontStyle:'italic' }}>free</span>
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { icon:'📸', text:'Report dirty areas with photos'         },
              { icon:'🤖', text:'Instant AI cleaning plan (GPT-4o)'      },
              { icon:'🎨', text:'Clean area visualization (DALL·E 3)'    },
              { icon:'📊', text:'Real-time complaint tracking'           },
              { icon:'🗓️', text:'Access to community events'            },
            ].map(item => (
              <div key={item.text} className="rg-benefits-item">
                <span style={{ fontSize:16, width:22, textAlign:'center' }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

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