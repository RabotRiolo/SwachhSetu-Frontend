import { useState, useEffect, useRef } from 'react'
import adminService from '../services/AdminService'

const EMPTY_FORM = { title: '', description: '', eventDate: '', location: '', imageUrl: '' }

export default function AdminEvents() {
  const [events, setEvents]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [showForm, setShowForm]           = useState(false)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]       = useState({})
  const [submitting, setSubmitting]       = useState(false)
  const [deleteId, setDeleteId]           = useState(null)
  const [deleting, setDeleting]           = useState(false)
  const [search, setSearch]               = useState('')
  const [tabFilter, setTabFilter]         = useState('all')
  const [sortBy, setSortBy]               = useState('date_asc')
  const [toast, setToast]                 = useState(null)
  const [imgPreviewError, setImgPreviewError] = useState(false)
  const formRef = useRef(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const fetchEvents = () => {
    setLoading(true)
    adminService.getAllEvents()
      .then(r => setEvents(r.data?.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchEvents() }, [])

  const now = new Date()

  const filtered = events
    .filter(e => {
      const matchSearch = !search.trim() || e.title?.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase())
      const eventDate   = e.eventDate ? new Date(e.eventDate) : null
      const matchTab    = tabFilter === 'all' || (tabFilter === 'upcoming' && eventDate && eventDate >= now) || (tabFilter === 'past' && eventDate && eventDate < now)
      return matchSearch && matchTab
    })
    .sort((a, b) => {
      if (sortBy === 'date_asc')  return new Date(a.eventDate) - new Date(b.eventDate)
      if (sortBy === 'date_desc') return new Date(b.eventDate) - new Date(a.eventDate)
      if (sortBy === 'title')     return a.title?.localeCompare(b.title)
      return 0
    })

  const upcomingCount = events.filter(e => e.eventDate && new Date(e.eventDate) >= now).length
  const pastCount     = events.filter(e => e.eventDate && new Date(e.eventDate) <  now).length

  const validate = () => {
    const errs = {}
    if (!form.title.trim())           errs.title       = 'Event title is required'
    if (!form.eventDate)              errs.eventDate   = 'Event date & time is required'
    if (!form.location.trim())        errs.location    = 'Location is required'
    if (!form.description.trim())     errs.description = 'Description is required'
    else if (form.description.trim().length < 20) errs.description = 'Description must be at least 20 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      await adminService.createEvent({ title: form.title.trim(), description: form.description.trim(), eventDate: form.eventDate, location: form.location.trim(), imageUrl: form.imageUrl.trim() || null })
      showToast('Event created successfully! 🗓️')
      setForm(EMPTY_FORM); setFormErrors({}); setShowForm(false); fetchEvents()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to create event', 'error') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await adminService.deleteEvent(deleteId); showToast('Event deleted'); setDeleteId(null); fetchEvents() }
    catch { showToast('Failed to delete event', 'error') }
    finally { setDeleting(false) }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
    if (name === 'imageUrl') setImgPreviewError(false)
  }

  const openForm = () => {
    setForm(EMPTY_FORM); setFormErrors({}); setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const getDaysLabel = (dateStr) => {
    if (!dateStr) return null
    const diff = Math.ceil((new Date(dateStr) - now) / (1000 * 60 * 60 * 24))
    if (diff < 0)   return { text: 'Ended',        bg: '#f5f5f4', color: '#a8a29e', border: '#e7e5e4' }
    if (diff === 0) return { text: 'Today!',        bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }
    if (diff === 1) return { text: 'Tomorrow',      bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }
    if (diff <= 7)  return { text: `${diff}d left`, bg: '#fff7ed', color: '#c2410c', border: '#fdba74' }
    return               { text: `${diff}d away`, bg: '#f5f5f4', color: '#78716c', border: '#e7e5e4' }
  }

  const Spinner = () => (
    <svg style={{ width:16,height:16,animation:'spin 0.7s linear infinite',flexShrink:0 }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path style={{ opacity:0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  )

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", position:'relative' }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .ae-fade { animation: fadeUp 0.5s ease both; }
        .ae-skeleton {
          background: linear-gradient(90deg,#f5f5f4 25%,#ede9e6 50%,#f5f5f4 75%);
          background-size:400px 100%; animation:shimmer 1.4s ease infinite; border-radius:14px;
        }
        .ae-input {
          width:100%; border:1.5px solid #e7e5e4; border-radius:12px;
          padding:11px 14px 11px 40px; font-size:14px; font-weight:600;
          font-family:inherit; color:#1c1917; background:#fff; outline:none; transition:all 0.2s; box-sizing:border-box;
        }
        .ae-input.no-icon { padding-left:14px; }
        .ae-input::placeholder { color:#a8a29e; font-weight:500; }
        .ae-input:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .ae-input.error { border-color:#fca5a5; background:#fff5f5; }
        .ae-textarea {
          width:100%; border:1.5px solid #e7e5e4; border-radius:14px;
          padding:12px 14px; font-size:14px; font-weight:600; font-family:inherit;
          color:#1c1917; background:#fff; outline:none; resize:none; transition:all 0.2s; box-sizing:border-box;
        }
        .ae-textarea::placeholder { color:#a8a29e; font-weight:500; }
        .ae-textarea:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .ae-textarea.error { border-color:#fca5a5; background:#fff5f5; }
        .ae-search {
          width:100%; border:1.5px solid #e7e5e4; border-radius:100px;
          padding:10px 36px 10px 40px; font-size:14px; font-weight:600;
          font-family:inherit; color:#1c1917; background:#fff; outline:none; transition:all 0.2s;
        }
        .ae-search::placeholder { color:#a8a29e; font-weight:500; }
        .ae-search:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .ae-select {
          border:1.5px solid #e7e5e4; border-radius:100px; padding:10px 16px;
          font-size:13px; font-weight:700; font-family:inherit; color:#57534e;
          background:#fff; outline:none; cursor:pointer;
        }
        .ae-select:focus { border-color:#15803d; }
        .ae-card {
          background:#fff; border-radius:22px; border:1.5px solid #f0ede8;
          overflow:hidden; transition:all 0.25s; box-shadow:0 2px 8px rgba(0,0,0,0.03);
        }
        .ae-card:hover { box-shadow:0 12px 36px rgba(0,0,0,0.08); border-color:#e7e5e4; transform:translateY(-2px); }
        .ae-tab {
          display:inline-flex; align-items:center; gap:5px;
          padding:7px 14px; border-radius:100px; font-size:12px; font-weight:800;
          border:none; cursor:pointer; font-family:inherit; transition:all 0.2s;
        }
        .ae-toast { animation: toastIn 0.3s ease both; }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div className="ae-toast" style={{ position:'fixed',top:20,right:20,zIndex:100,display:'flex',alignItems:'center',gap:10,padding:'13px 20px',borderRadius:16,background:toast.type==='error'?'#ef4444':'#15803d',color:'#fff',fontSize:13,fontWeight:800,boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>{toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="ae-fade" style={{ display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'flex-start',gap:16,marginBottom:28 }}>
        <div>
          <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:100,padding:'5px 14px',marginBottom:12 }}>
            <span style={{ width:7,height:7,background:'#22c55e',borderRadius:'50%' }} />
            <span style={{ fontSize:11,fontWeight:800,color:'#15803d',letterSpacing:'0.06em' }}>EVENTS</span>
          </div>
          <h1 style={{ fontFamily:'Fraunces,serif',fontSize:'clamp(22px,3vw,32px)',fontWeight:900,letterSpacing:'-0.02em',color:'#1c1917',marginBottom:6,lineHeight:1.1 }}>
            Manage <span style={{ color:'#15803d',fontStyle:'italic' }}>Events</span>
          </h1>
          <p style={{ fontSize:14,color:'#78716c',fontWeight:500 }}>Create and manage community cleanliness drive events</p>
        </div>
        <button onClick={openForm} style={{ display:'inline-flex',alignItems:'center',gap:8,background:'#15803d',color:'#fff',padding:'11px 22px',borderRadius:100,fontSize:13,fontWeight:800,border:'none',cursor:'pointer',boxShadow:'0 4px 14px rgba(21,128,61,0.25)',transition:'all 0.2s',fontFamily:'inherit' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#166534';e.currentTarget.style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='#15803d';e.currentTarget.style.transform='none'}}
        >➕ Create Event</button>
      </div>

      {/* ── STAT TILES ── */}
      <div className="ae-fade" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28 }}>
        {[
          { label:'Total',    value:events.length, icon:'🗓️', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
          { label:'Upcoming', value:upcomingCount, icon:'🔜', color:'#15803d', bg:'#f0fdf4', border:'#bbf7d0' },
          { label:'Past',     value:pastCount,     icon:'✅', color:'#78716c', bg:'#f5f5f4', border:'#e7e5e4' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:20,padding:'16px 12px',textAlign:'center' }}>
            <div style={{ fontSize:20,marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:'Fraunces,serif',fontSize:28,fontWeight:900,color:s.color,lineHeight:1,marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:11,color:'#a8a29e',fontWeight:700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── CREATE FORM ── */}
      {showForm && (
        <div ref={formRef} className="ae-fade" style={{ background:'#fff',borderRadius:24,border:'1.5px solid #f0ede8',overflow:'hidden',marginBottom:28,boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ height:4,background:'linear-gradient(90deg,#15803d,#059669)' }} />
          <div style={{ padding:'28px 32px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
              <p style={{ fontFamily:'Fraunces,serif',fontSize:20,fontWeight:900,color:'#1c1917',letterSpacing:'-0.01em' }}>➕ Create New Event</p>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormErrors({}) }}
                style={{ background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#a8a29e',padding:4 }}
                onMouseEnter={e=>e.currentTarget.style.color='#1c1917'} onMouseLeave={e=>e.currentTarget.style.color='#a8a29e'}>✕</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Title + Location */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
                <div>
                  <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>Event Title <span style={{ color:'#ef4444' }}>*</span></label>
                  <input type="text" name="title" value={form.title} onChange={handleFormChange}
                    placeholder="e.g. Sector 14 Cleanliness Drive" disabled={submitting}
                    className={`ae-input no-icon ${formErrors.title ? 'error' : ''}`} />
                  {formErrors.title && <p style={{ color:'#ef4444',fontSize:12,fontWeight:700,marginTop:5 }}>{formErrors.title}</p>}
                </div>
                <div>
                  <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>Location <span style={{ color:'#ef4444' }}>*</span></label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>📍</span>
                    <input type="text" name="location" value={form.location} onChange={handleFormChange}
                      placeholder="e.g. Sector 14 Market, Dwarka" disabled={submitting}
                      className={`ae-input ${formErrors.location ? 'error' : ''}`} />
                  </div>
                  {formErrors.location && <p style={{ color:'#ef4444',fontSize:12,fontWeight:700,marginTop:5 }}>{formErrors.location}</p>}
                </div>
              </div>

              {/* Date + Image */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
                <div>
                  <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>Event Date & Time <span style={{ color:'#ef4444' }}>*</span></label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>📅</span>
                    <input type="datetime-local" name="eventDate" value={form.eventDate} onChange={handleFormChange}
                      disabled={submitting} className={`ae-input ${formErrors.eventDate ? 'error' : ''}`} />
                  </div>
                  {formErrors.eventDate && <p style={{ color:'#ef4444',fontSize:12,fontWeight:700,marginTop:5 }}>{formErrors.eventDate}</p>}
                </div>
                <div>
                  <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>Cover Image URL <span style={{ fontSize:11,color:'#a8a29e',fontWeight:500 }}>(optional)</span></label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>🖼️</span>
                    <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleFormChange}
                      placeholder="https://example.com/event.jpg" disabled={submitting}
                      className="ae-input" />
                  </div>
                </div>
              </div>

              {/* Image preview */}
              {form.imageUrl && !imgPreviewError && (
                <div style={{ position:'relative',borderRadius:16,overflow:'hidden',height:120,background:'#f5f5f4',marginBottom:16 }}>
                  <img src={form.imageUrl} alt="Preview" onError={() => setImgPreviewError(true)} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                  <div style={{ position:'absolute',top:10,right:10,background:'#15803d',color:'#fff',fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:100 }}>✓ Preview</div>
                </div>
              )}
              {form.imageUrl && imgPreviewError && (
                <p style={{ color:'#d97706',fontSize:12,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:5 }}>⚠️ Could not load image preview</p>
              )}

              {/* Description */}
              <div style={{ marginBottom:24 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7 }}>
                  <label style={{ fontSize:13,fontWeight:800,color:'#1c1917' }}>Description <span style={{ color:'#ef4444' }}>*</span></label>
                  <span style={{ fontSize:11,color:'#a8a29e',fontWeight:700 }}>{form.description.length} chars</span>
                </div>
                <textarea name="description" value={form.description} onChange={handleFormChange}
                  placeholder="Describe the event — purpose, what to bring, how to participate..."
                  rows={4} disabled={submitting}
                  className={`ae-textarea ${formErrors.description ? 'error' : ''}`} />
                {formErrors.description && <p style={{ color:'#ef4444',fontSize:12,fontWeight:700,marginTop:5 }}>{formErrors.description}</p>}
              </div>

              {/* Buttons */}
              <div style={{ display:'flex',gap:10 }}>
                <button type="submit" disabled={submitting} style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#15803d',color:'#fff',border:'none',borderRadius:100,padding:'13px',fontSize:14,fontWeight:800,cursor:submitting?'not-allowed':'pointer',fontFamily:'inherit',transition:'all 0.2s',opacity:submitting?0.7:1,boxShadow:'0 4px 14px rgba(21,128,61,0.3)' }}>
                  {submitting ? <><Spinner />Creating...</> : <>🗓️ Create Event</>}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormErrors({}) }} disabled={submitting}
                  style={{ padding:'13px 24px',borderRadius:100,border:'1.5px solid #e7e5e4',background:'#fff',color:'#78716c',fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f5f5f4'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
        {/* Tabs */}
        <div style={{ display:'flex',gap:4,background:'#fff',border:'1.5px solid #e7e5e4',borderRadius:100,padding:4,width:'fit-content' }}>
          {[
            { key:'all',      label:'All',      count:events.length },
            { key:'upcoming', label:'Upcoming', count:upcomingCount },
            { key:'past',     label:'Past',     count:pastCount     },
          ].map(t => (
            <button key={t.key} onClick={() => setTabFilter(t.key)} className="ae-tab"
              style={{ background:tabFilter===t.key?'#15803d':'transparent', color:tabFilter===t.key?'#fff':'#78716c' }}>
              {t.label}
              <span style={{ fontSize:11,fontWeight:800,padding:'2px 6px',borderRadius:100,background:tabFilter===t.key?'rgba(255,255,255,0.25)':'#f5f5f4',color:tabFilter===t.key?'#fff':'#a8a29e' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        {/* Search + sort */}
        <div style={{ display:'flex',flexWrap:'wrap',gap:10 }}>
          <div style={{ position:'relative',flex:1,minWidth:200 }}>
            <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or location..." className="ae-search" />
            {search && (
              <button onClick={() => setSearch('')} style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#a8a29e',fontWeight:800 }}>✕</button>
            )}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="ae-select">
            <option value="date_asc">📅 Soonest First</option>
            <option value="date_desc">📅 Latest First</option>
            <option value="title">🔤 Title A → Z</option>
          </select>
        </div>
        {!loading && (
          <p style={{ fontSize:13,color:'#a8a29e',fontWeight:700 }}>
            {filtered.length} event{filtered.length!==1?'s':''} shown
            {search && <span style={{ color:'#78716c' }}> · "{search}"</span>}
          </p>
        )}
      </div>

      {/* ── EVENTS LIST ── */}
      {loading ? (
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background:'#fff',borderRadius:22,border:'1.5px solid #f0ede8',padding:20,display:'flex',gap:14 }}>
              <div className="ae-skeleton" style={{ width:100,height:100,flexShrink:0 }} />
              <div style={{ flex:1,display:'flex',flexDirection:'column',gap:10 }}>
                <div className="ae-skeleton" style={{ height:14,width:'55%' }} />
                <div className="ae-skeleton" style={{ height:11,width:'35%' }} />
                <div className="ae-skeleton" style={{ height:11,width:'45%' }} />
              </div>
            </div>
          ))}
        </div>

      ) : filtered.length === 0 ? (
        <div style={{ background:'#fff',borderRadius:24,border:'1.5px solid #f0ede8',textAlign:'center',padding:'72px 32px' }}>
          <div style={{ fontSize:56,marginBottom:14 }}>{search ? '🔍' : '🗓️'}</div>
          <h3 style={{ fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:'#1c1917',marginBottom:8,letterSpacing:'-0.01em' }}>
            {search ? 'No events found' : tabFilter === 'upcoming' ? 'No upcoming events' : tabFilter === 'past' ? 'No past events' : 'No events yet'}
          </h3>
          <p style={{ fontSize:14,color:'#78716c',marginBottom:24,lineHeight:1.6 }}>
            {search ? `No results for "${search}"` : 'Create your first community event to get started.'}
          </p>
          {!search && tabFilter === 'all'
            ? <button onClick={openForm} style={{ background:'#15803d',color:'#fff',border:'none',borderRadius:100,padding:'12px 28px',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 14px rgba(21,128,61,0.25)',fontFamily:'inherit' }}>➕ Create First Event</button>
            : <button onClick={() => { setSearch(''); setTabFilter('all') }} style={{ background:'none',border:'none',cursor:'pointer',color:'#15803d',fontSize:14,fontWeight:800,fontFamily:'inherit',textDecoration:'underline' }}>Clear Filters</button>
          }
        </div>

      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {filtered.map(event => {
            const isPast        = event.eventDate && new Date(event.eventDate) < now
            const daysLabel     = getDaysLabel(event.eventDate)
            const formattedDate = event.eventDate
              ? new Date(event.eventDate).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})
              : null
            const formattedTime = event.eventDate
              ? new Date(event.eventDate).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})
              : null

            return (
              <div key={event.id} className="ae-card" style={ isPast ? { opacity:0.8 } : {} }>
                <div style={{ display:'flex' }}>
                  {/* Cover */}
                  <div style={{ width:110,flexShrink:0,background:'linear-gradient(135deg,#dcfce7,#d1fae5)',overflow:'hidden',minHeight:100,filter:isPast?'grayscale(0.6)':'none' }}>
                    {event.imageUrl
                      ? <img src={event.imageUrl} alt={event.title} onError={e=>e.target.style.display='none'} style={{ width:'100%',height:'100%',objectFit:'cover',minHeight:100 }} />
                      : <div style={{ width:'100%',minHeight:100,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,opacity:0.35 }}>🌿</div>
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex:1,padding:'16px 20px',display:'flex',flexDirection:'column',justifyContent:'space-between',minWidth:0 }}>
                    <div>
                      <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',gap:8,marginBottom:6 }}>
                        <h3 style={{ fontFamily:'Fraunces,serif',fontWeight:900,fontSize:16,color:'#1c1917',letterSpacing:'-0.01em',lineHeight:1.2 }}>{event.title}</h3>
                        {daysLabel && (
                          <span style={{ fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:100,background:daysLabel.bg,color:daysLabel.color,border:`1px solid ${daysLabel.border}`,flexShrink:0 }}>
                            {daysLabel.text}
                          </span>
                        )}
                        {isPast && (
                          <span style={{ fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:100,background:'#f5f5f4',color:'#a8a29e',border:'1px solid #e7e5e4',flexShrink:0 }}>Completed</span>
                        )}
                      </div>
                      <p style={{ fontSize:13,color:'#78716c',lineHeight:1.6,marginBottom:10,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>
                        {event.description}
                      </p>
                    </div>

                    <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:10 }}>
                      <div style={{ display:'flex',flexWrap:'wrap',gap:12 }}>
                        {formattedDate && (
                          <span style={{ fontSize:12,color:'#a8a29e',fontWeight:600,display:'inline-flex',alignItems:'center',gap:4 }}>
                            📅 {formattedDate}
                            {formattedTime && <span style={{ color:'#d6d3d1' }}>· {formattedTime}</span>}
                          </span>
                        )}
                        {event.location && (
                          <span style={{ fontSize:12,color:'#a8a29e',fontWeight:600,display:'inline-flex',alignItems:'center',gap:4,overflow:'hidden',maxWidth:200,textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                            📍 {event.location}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setDeleteId(event.id)} style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#fff5f5',border:'1.5px solid #fca5a5',color:'#ef4444',padding:'7px 14px',borderRadius:100,fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'} onMouseLeave={e=>e.currentTarget.style.background='#fff5f5'}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteId && (
        <div style={{ position:'fixed',inset:0,background:'rgba(28,25,23,0.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20 }}>
          <div style={{ background:'#fff',borderRadius:28,padding:'40px 36px',maxWidth:380,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.2)',border:'1.5px solid #f0ede8' }}>
            <div style={{ fontSize:52,marginBottom:16 }}>🗑️</div>
            <h3 style={{ fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,letterSpacing:'-0.01em',color:'#1c1917',marginBottom:10 }}>Delete Event?</h3>
            <p style={{ fontSize:14,color:'#78716c',lineHeight:1.7,marginBottom:28 }}>
              This event will be permanently removed and citizens will no longer see it.
            </p>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                style={{ flex:1,background:'#f5f5f4',border:'1.5px solid #e7e5e4',borderRadius:100,padding:13,fontSize:14,fontWeight:800,color:'#57534e',cursor:'pointer',fontFamily:'inherit' }}
                onMouseEnter={e=>e.currentTarget.style.background='#ede9e6'} onMouseLeave={e=>e.currentTarget.style.background='#f5f5f4'}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex:1,background:'#ef4444',border:'none',borderRadius:100,padding:13,fontSize:14,fontWeight:800,color:'#fff',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 14px rgba(239,68,68,0.3)',opacity:deleting?0.65:1 }}
                onMouseEnter={e=>!deleting&&(e.currentTarget.style.background='#dc2626')} onMouseLeave={e=>e.currentTarget.style.background='#ef4444'}>
                {deleting ? <Spinner /> : '🗑️'} Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}