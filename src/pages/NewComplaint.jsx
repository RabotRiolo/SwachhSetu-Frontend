import { useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import complaintService from '../services/ComplaintService'

const AI_STAGES = [
  { icon: '📤', title: 'Uploading your photo...',     desc: 'Securely uploading your complaint image',                    progress: 20 },
  { icon: '🤖', title: 'AI is analyzing the area...', desc: 'GPT-4o is generating a 5-step cleaning plan',               progress: 60 },
  { icon: '🎨', title: 'Creating clean vision...',    desc: 'DALL-E 3 is painting how the area will look after cleaning', progress: 90 },
]

export default function NewComplaint() {
  const navigate = useNavigate()

  const [area,        setArea]        = useState('')
  const [file,        setFile]        = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [dragging,    setDragging]    = useState(false)
  const [errors,      setErrors]      = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [aiStage,     setAiStage]     = useState(0)   // 0 = idle, 1-3 = stages
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef(null)

  // ── FILE HANDLING ──────────────────────────────────────────────────────────
  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return
    if (!selectedFile.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, file: 'Please upload an image file (JPG, PNG, WEBP)' }))
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'Image must be under 5MB' }))
      return
    }
    setFile(selectedFile)
    setErrors(prev => ({ ...prev, file: '' }))
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(selectedFile)
  }, [])

  const handleFileInput = (e)  => handleFile(e.target.files?.[0])
  const handleDrop      = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }, [handleFile])
  const handleDragOver  = (e)  => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = ()   => setDragging(false)
  const removeFile      = ()   => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── VALIDATION ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!area.trim())                errs.area = 'Please describe the location/area'
    else if (area.trim().length < 5) errs.area = 'Area description must be at least 5 characters'
    if (!file)                       errs.file = 'Please upload a photo of the dirty area'
    return errs
  }

  // ── SUBMIT ─────────────────────────────────────────────────────────────────
  // FIX: Real API call happens at Stage 1 (upload), stages 2-3 are AI processing delays
  // FIX: No manual Content-Type header — browser sets multipart boundary automatically
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    setSubmitError('')
    setAiStage(1) // Stage 1: "Uploading your photo..."

    try {
      const formData = new FormData()
      formData.append('area', area.trim())
      formData.append('imageFile', file) // ← must match your backend multer field name

      // Real network request during Stage 1 (upload stage)
      const res = await complaintService.create(formData)
      const id  = res.data?.data?.id

      setAiStage(2) // Stage 2: "AI is analyzing..."
      await new Promise(r => setTimeout(r, 1500))

      setAiStage(3) // Stage 3: "Creating clean vision..."
      await new Promise(r => setTimeout(r, 1200))

      setSubmitting(false)
      setAiStage(0)
      navigate(id ? `/complaints/${id}` : '/dashboard')

    } catch (err) {
      console.error('Complaint submission error:', err)
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.message                 ||
        'Failed to submit complaint. Please try again.'
      setSubmitError(errorMsg)
      setSubmitting(false)
      setAiStage(0)
    }
  }

  const currentStage = aiStage > 0 ? AI_STAGES[aiStage - 1] : null

  // ── AI LOADING OVERLAY ─────────────────────────────────────────────────────
  if (submitting) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1c1917',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', position: 'relative', overflow: 'hidden',
        fontFamily: "'Nunito','DM Sans',sans-serif",
      }}>
        <style>{`
          @keyframes bounce-ai  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
          @keyframes pulse-ring { 0%{transform:scale(0.9);opacity:0.8} 100%{transform:scale(1.6);opacity:0} }
        `}</style>

        {/* Decorative blobs */}
        <div style={{ position:'absolute',top:-80,right:-80,width:400,height:400,background:'radial-gradient(circle,rgba(21,128,61,0.3),transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-80,left:-60,width:320,height:320,background:'radial-gradient(circle,rgba(217,119,6,0.2),transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />
        <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',backgroundSize:'24px 24px',pointerEvents:'none' }} />

        <div style={{
          position:'relative', background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)',
          border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:32,
          padding:'48px 40px', maxWidth:420, width:'100%', textAlign:'center',
          color:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize:72, marginBottom:24, display:'inline-block', animation:'bounce-ai 1.2s ease-in-out infinite' }}>
            {currentStage?.icon}
          </div>

          <h2 style={{ fontFamily:'Fraunces,serif', fontSize:26, fontWeight:900, letterSpacing:'-0.02em', marginBottom:8, lineHeight:1.1 }}>
            {currentStage?.title}
          </h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.6)', marginBottom:32, lineHeight:1.6 }}>
            {currentStage?.desc}
          </p>

          {/* Progress bar */}
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:100, height:10, marginBottom:10, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:100,
              background:'linear-gradient(90deg,#15803d,#d97706)',
              width:`${currentStage?.progress ?? 0}%`,
              transition:'width 1s ease',
            }} />
          </div>
          <p style={{ fontSize:13, color:'#fbbf24', fontWeight:800, marginBottom:28 }}>
            {currentStage?.progress}% complete
          </p>

          {/* Stage pills */}
          <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
            {AI_STAGES.map((stage, i) => (
              <div key={i} style={{
                display:'inline-flex', alignItems:'center', gap:5,
                padding:'6px 12px', borderRadius:100, fontSize:11, fontWeight:800, transition:'all 0.3s',
                background:
                  i + 1 < aiStage  ? 'rgba(21,128,61,0.3)'      :
                  i + 1 === aiStage ? 'rgba(251,191,36,0.25)'    : 'rgba(255,255,255,0.05)',
                color:
                  i + 1 < aiStage  ? '#86efac'                   :
                  i + 1 === aiStage ? '#fbbf24'                   : 'rgba(255,255,255,0.25)',
                border:
                  i + 1 === aiStage ? '1px solid rgba(251,191,36,0.4)' : '1px solid transparent',
                textDecoration: i + 1 < aiStage ? 'line-through' : 'none',
              }}>
                <span>{i + 1 < aiStage ? '✓' : stage.icon}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:24 }}>
            Please don't close this page...
          </p>
        </div>
      </div>
    )
  }

  // ── MAIN FORM ──────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", minHeight:'100vh', background:'#fffdf7', padding:'40px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%{transform:scale(0.9);opacity:0.8} 100%{transform:scale(1.4);opacity:0} }
        .nc-fade { animation:fadeUp 0.5s ease both; }
        .nc-d1{animation-delay:0.05s} .nc-d2{animation-delay:0.1s} .nc-d3{animation-delay:0.15s} .nc-d4{animation-delay:0.2s}

        .nc-textarea {
          width:100%; border:1.5px solid #e7e5e4; border-radius:16px;
          padding:13px 16px; font-size:14px; font-weight:600; font-family:inherit;
          color:#1c1917; background:#fafaf8; outline:none; resize:none; transition:all 0.2s;
          box-sizing:border-box; line-height:1.7;
        }
        .nc-textarea::placeholder { color:#a8a29e; font-weight:500; }
        .nc-textarea:focus        { border-color:#15803d; background:#fff; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .nc-textarea.error        { border-color:#fca5a5; background:#fff5f5; }

        .nc-drop {
          border:2px dashed #e7e5e4; border-radius:20px; height:200px;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.2s; background:#fafaf8;
        }
        .nc-drop:hover         { border-color:#15803d; background:#f0fdf4; }
        .nc-drop.dragging      { border-color:#15803d; background:#f0fdf4; transform:scale(1.01); }
        .nc-drop.error         { border-color:#fca5a5; background:#fff5f5; }

        .nc-submit {
          width:100%; background:#15803d; color:#fff; border:none;
          border-radius:100px; padding:17px; font-size:16px; font-weight:800;
          font-family:inherit; cursor:pointer; display:flex; align-items:center;
          justify-content:center; gap:10px;
          box-shadow:0 8px 28px rgba(21,128,61,0.3); transition:all 0.25s;
        }
        .nc-submit:hover:not(:disabled) { background:#166534; transform:translateY(-2px); box-shadow:0 14px 36px rgba(21,128,61,0.4); }
        .nc-submit:disabled              { opacity:0.5; cursor:not-allowed; transform:none; }
      `}</style>

      <div style={{ maxWidth:580, margin:'0 auto' }}>

        {/* Back link */}
        <Link
          to="/dashboard"
          style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#15803d', textDecoration:'none', fontSize:13, fontWeight:800, marginBottom:24, transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#166534'}
          onMouseLeave={e => e.currentTarget.style.color = '#15803d'}
        >
          ← Back to Dashboard
        </Link>

        {/* Hero header */}
        <div className="nc-fade nc-d1" style={{ background:'#1c1917', borderRadius:28, padding:'28px 32px', color:'#fff', marginBottom:20, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',backgroundSize:'20px 20px',pointerEvents:'none' }} />
          <div style={{ position:'absolute',top:-40,right:-40,width:180,height:180,background:'radial-gradient(circle,rgba(21,128,61,0.4),transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />
          <div style={{ position:'absolute',bottom:-40,left:-20,width:140,height:140,background:'radial-gradient(circle,rgba(217,119,6,0.25),transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:100, padding:'6px 14px', marginBottom:14 }}>
              <span style={{ width:7, height:7, background:'#fbbf24', borderRadius:'50%', position:'relative', display:'inline-block' }}>
                <span style={{ position:'absolute', inset:-2, background:'#fbbf24', borderRadius:'50%', opacity:0.4, animation:'pulse-ring 1.5s ease-out infinite' }} />
              </span>
              <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.05em', color:'rgba(255,255,255,0.9)' }}>Powered by GPT-4o + DALL-E 3</span>
            </div>
            <h1 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(22px,4vw,30px)', fontWeight:900, letterSpacing:'-0.02em', marginBottom:8, lineHeight:1.1 }}>
              📸 Report <span style={{ color:'#86efac', fontStyle:'italic' }}>Dirty Area</span>
            </h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>
              Upload a photo and our AI will instantly generate a cleaning plan and visualize how the area can look after cleaning.
            </p>
          </div>
        </div>

        {/* How it works steps */}
        <div className="nc-fade nc-d2" style={{ display:'flex', alignItems:'center', gap:0, marginBottom:20, overflowX:'auto', paddingBottom:4 }}>
          {[
            { icon:'📸', label:'Upload Photo'  },
            { icon:'🤖', label:'AI Analyzes'   },
            { icon:'🎨', label:'Clean Vision'  },
            { icon:'✅', label:'Team Assigned' },
          ].map((step, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:44, height:44, background:'#fff', borderRadius:'50%', border:'1.5px solid #f0ede8', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  {step.icon}
                </div>
                <p style={{ fontSize:11, color:'#78716c', fontWeight:700, marginTop:6, whiteSpace:'nowrap' }}>{step.label}</p>
              </div>
              {i < 3 && <div style={{ height:1.5, width:36, background:'#e7e5e4', margin:'0 4px', marginBottom:14, flexShrink:0 }} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="nc-fade nc-d3" style={{ background:'#fff', borderRadius:24, border:'1.5px solid #f0ede8', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ height:4, background:'linear-gradient(90deg,#15803d,#059669,#d97706)' }} />

          <form onSubmit={handleSubmit} noValidate style={{ padding:'28px 32px', display:'flex', flexDirection:'column', gap:24 }}>

            {/* Global submit error */}
            {submitError && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#fff5f5', border:'1.5px solid #fca5a5', borderRadius:14, padding:'14px 16px' }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <p style={{ fontSize:13, color:'#dc2626', fontWeight:600, lineHeight:1.5 }}>{submitError}</p>
              </div>
            )}

            {/* Area / location */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:800, color:'#1c1917', marginBottom:8 }}>
                📍 Area / Location Description <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <textarea
                value={area}
                onChange={e => { setArea(e.target.value); if (errors.area) setErrors(prev => ({ ...prev, area:'' })) }}
                placeholder="e.g. Near Gate No. 3, Sector 14 Market, Dwarka, New Delhi — garbage pile near the footpath"
                rows={3}
                maxLength={500}
                disabled={submitting}
                className={`nc-textarea ${errors.area ? 'error' : ''}`}
              />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
                {errors.area
                  ? <p style={{ fontSize:12, color:'#ef4444', fontWeight:700 }}>{errors.area}</p>
                  : <p style={{ fontSize:12, color:'#a8a29e', fontWeight:500 }}>Be specific — include landmark, locality, city</p>
                }
                <p style={{ fontSize:11, color:'#d6d3d1', fontWeight:700, flexShrink:0, marginLeft:8 }}>{area.length}/500</p>
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:800, color:'#1c1917', marginBottom:8 }}>
                🖼️ Photo of Dirty Area <span style={{ color:'#ef4444' }}>*</span>
              </label>

              {preview ? (
                <div style={{ position:'relative', borderRadius:20, overflow:'hidden', border:'2px solid #15803d', boxShadow:'0 4px 16px rgba(21,128,61,0.15)' }}>
                  <img src={preview} alt="Preview" style={{ width:'100%', height:240, objectFit:'cover', display:'block' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.6),transparent)' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>🖼️</div>
                      <div>
                        <p style={{ color:'#fff', fontSize:12, fontWeight:700, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file?.name}</p>
                        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>{file ? (file.size / 1024).toFixed(0) + ' KB' : ''}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      style={{ background:'#ef4444', border:'none', color:'#fff', fontSize:11, fontWeight:800, padding:'7px 14px', borderRadius:100, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div style={{ position:'absolute', top:12, right:12, background:'#15803d', color:'#fff', fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:100 }}>✓ Ready</div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`nc-drop ${dragging ? 'dragging' : ''} ${errors.file ? 'error' : ''}`}
                >
                  <div style={{ fontSize:48, marginBottom:12, transition:'transform 0.2s', transform:dragging ? 'scale(1.2)' : 'none' }}>
                    {dragging ? '📂' : '📸'}
                  </div>
                  <p style={{ fontWeight:800, color:'#57534e', fontSize:14, marginBottom:5 }}>
                    {dragging ? 'Drop image here!' : 'Click or drag & drop photo'}
                  </p>
                  <p style={{ fontSize:12, color:'#a8a29e', fontWeight:500, marginBottom:16 }}>JPG, PNG, WEBP · Max 5MB</p>
                  <div style={{ background:'#15803d', color:'#fff', padding:'9px 22px', borderRadius:100, fontSize:12, fontWeight:800, boxShadow:'0 4px 12px rgba(21,128,61,0.25)' }}>
                    Browse Files
                  </div>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display:'none' }} />
              {errors.file && (
                <p style={{ color:'#ef4444', fontSize:12, fontWeight:700, marginTop:8, display:'flex', alignItems:'center', gap:5 }}>⚠️ {errors.file}</p>
              )}
            </div>

            {/* AI info card */}
            <div style={{ background:'linear-gradient(135deg,#eff6ff,#f5f3ff)', border:'1.5px solid #bfdbfe', borderRadius:18, padding:'18px 20px' }}>
              <p style={{ fontSize:13, fontWeight:800, color:'#1e40af', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                🤖 What happens after you submit?
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  <><strong>GPT-4o</strong> analyzes your photo and generates a 5-step cleaning action plan</>,
                  <><strong>DALL-E 3</strong> creates a visualization of how the area will look after cleaning</>,
                  <>Admin reviews and assigns a <strong>cleaning team</strong> to your complaint</>,
                  <>You can <strong>track progress</strong> in real time on your dashboard</>,
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <span style={{ fontSize:12, color:'#3b82f6', fontWeight:800, flexShrink:0, marginTop:1 }}>{i + 1}.</span>
                    <p style={{ fontSize:13, color:'#1e40af', fontWeight:500, lineHeight:1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" disabled={submitting || !area.trim() || !file} className="nc-submit">
              <span style={{ fontSize:20 }}>🚀</span>
              <span>Submit & Let AI Analyze</span>
            </button>

            <p style={{ textAlign:'center', fontSize:12, color:'#a8a29e', fontWeight:500 }}>
              AI analysis may take 15–30 seconds · Please stay on the page
            </p>
          </form>
        </div>

        {/* Tips card */}
        <div className="nc-fade nc-d4" style={{ marginTop:16, background:'linear-gradient(135deg,#fef9c3,#fef3c7)', border:'1.5px solid #fde68a', borderRadius:20, padding:'20px 24px' }}>
          <p style={{ fontSize:13, fontWeight:800, color:'#92400e', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
            💡 Tips for a better complaint
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              'Take a clear, well-lit photo of the dirty area',
              'Include surroundings so the location is identifiable',
              'Mention exact landmarks in the area description',
              'Avoid blurry or very dark images for better AI analysis',
            ].map((tip, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                <span style={{ color:'#d97706', fontWeight:800, fontSize:12, flexShrink:0, marginTop:2 }}>→</span>
                <p style={{ fontSize:13, color:'#a16207', fontWeight:600, lineHeight:1.6 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}