import { useState, useEffect } from 'react'
import adminService from '../services/AdminService'

const EMPTY_FORM = { name: '', contactEmail: '', membersCount: '' }

export default function AdminTeams() {
  const [teams, setTeams]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]   = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast]             = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchTeams = () => {
    setLoading(true)
    adminService.getAllTeams()
      .then(r => setTeams(r.data?.data || []))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTeams() }, [])

  const filtered = teams.filter(t => {
    const matchSearch =
      !search.trim() ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.contactEmail?.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active'   &&  t.active !== false) ||
      (statusFilter === 'inactive' &&  t.active === false)
    return matchSearch && matchStatus
  })

  const activeCount   = teams.filter(t => t.active !== false).length
  const inactiveCount = teams.filter(t => t.active === false).length

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Team name is required'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (form.membersCount && isNaN(Number(form.membersCount))) errs.membersCount = 'Must be a valid number'
    if (form.membersCount && Number(form.membersCount) < 0) errs.membersCount = 'Cannot be negative'
    return errs
  }

  const openCreate = () => { setEditingTeam(null); setForm(EMPTY_FORM); setFormErrors({}); setShowForm(true) }
  const openEdit = (team) => {
    setEditingTeam(team)
    setForm({ name: team.name||'', contactEmail: team.contactEmail||'', membersCount: team.membersCount!=null ? String(team.membersCount) : '' })
    setFormErrors({}); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditingTeam(null); setForm(EMPTY_FORM); setFormErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setSubmitting(true)
    const payload = { name: form.name.trim(), contactEmail: form.contactEmail.trim() || null, membersCount: form.membersCount ? Number(form.membersCount) : null }
    try {
      if (editingTeam) { await adminService.updateTeam(editingTeam.id, payload); showToast('Team updated ✏️') }
      else             { await adminService.createTeam(payload); showToast('Team created 👷') }
      closeForm(); fetchTeams()
    } catch (err) { showToast(err.response?.data?.message || 'Operation failed', 'error') }
    finally { setSubmitting(false) }
  }

  const handleToggleActive = async (team) => {
    try {
      await adminService.updateTeam(team.id, { ...team, active: !team.active })
      showToast(team.active ? 'Team deactivated' : 'Team activated ✅')
      fetchTeams()
    } catch { showToast('Failed to update team status', 'error') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await adminService.deleteTeam(deleteId); showToast('Team deleted'); setDeleteId(null); fetchTeams() }
    catch { showToast('Failed to delete team', 'error') }
    finally { setDeleting(false) }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
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
        .at-fade { animation: fadeUp 0.5s ease both; }
        .at-skeleton {
          background: linear-gradient(90deg,#f5f5f4 25%,#ede9e6 50%,#f5f5f4 75%);
          background-size: 400px 100%; animation: shimmer 1.4s ease infinite; border-radius:12px;
        }
        .at-input {
          width:100%; border:1.5px solid #e7e5e4; border-radius:12px;
          padding:11px 14px 11px 40px; font-size:14px; font-weight:600;
          font-family:inherit; color:#1c1917; background:#fff; outline:none; transition:all 0.2s;
          box-sizing:border-box;
        }
        .at-input::placeholder { color:#a8a29e; font-weight:500; }
        .at-input:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .at-input.error { border-color:#fca5a5; background:#fff5f5; }
        .at-textarea {
          width:100%; border:1.5px solid #e7e5e4; border-radius:14px;
          padding:11px 14px; font-size:14px; font-weight:600; font-family:inherit;
          color:#1c1917; background:#fff; outline:none; resize:none; transition:all 0.2s;
          box-sizing:border-box;
        }
        .at-textarea::placeholder { color:#a8a29e; font-weight:500; }
        .at-textarea:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .at-search {
          width:100%; border:1.5px solid #e7e5e4; border-radius:100px;
          padding:10px 36px 10px 40px; font-size:14px; font-weight:600;
          font-family:inherit; color:#1c1917; background:#fff; outline:none; transition:all 0.2s;
        }
        .at-search::placeholder { color:#a8a29e; font-weight:500; }
        .at-search:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .at-card {
          background:#fff; border-radius:22px; border:1.5px solid #f0ede8;
          display:flex; flex-direction:column; overflow:hidden;
          transition:all 0.25s; box-shadow:0 2px 8px rgba(0,0,0,0.03);
        }
        .at-card:hover { box-shadow:0 12px 36px rgba(0,0,0,0.08); border-color:#e7e5e4; transform:translateY(-2px); }
        .at-card.inactive { opacity:0.72; }
        .at-btn {
          display:inline-flex; align-items:center; justify-content:center; gap:6px;
          padding:8px 14px; border-radius:100px; font-size:12px; font-weight:800;
          border:1.5px solid; cursor:pointer; transition:all 0.15s; font-family:inherit;
        }
        .at-tab {
          display:inline-flex; align-items:center; gap:5px;
          padding:7px 14px; border-radius:100px;
          font-size:12px; font-weight:800; border:none; cursor:pointer;
          font-family:inherit; transition:all 0.2s;
        }
        .at-toast { animation: toastIn 0.3s ease both; }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div className="at-toast" style={{ position:'fixed',top:20,right:20,zIndex:100,display:'flex',alignItems:'center',gap:10,padding:'13px 20px',borderRadius:16,background:toast.type==='error'?'#ef4444':'#15803d',color:'#fff',fontSize:13,fontWeight:800,boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>{toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="at-fade" style={{ display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'flex-start',gap:16,marginBottom:28 }}>
        <div>
          <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:100,padding:'5px 14px',marginBottom:12 }}>
            <span style={{ width:7,height:7,background:'#22c55e',borderRadius:'50%' }} />
            <span style={{ fontSize:11,fontWeight:800,color:'#15803d',letterSpacing:'0.06em' }}>TEAMS</span>
          </div>
          <h1 style={{ fontFamily:'Fraunces,serif',fontSize:'clamp(22px,3vw,32px)',fontWeight:900,letterSpacing:'-0.02em',color:'#1c1917',marginBottom:6,lineHeight:1.1 }}>
            Manage <span style={{ color:'#15803d',fontStyle:'italic' }}>Teams</span>
          </h1>
          <p style={{ fontSize:14,color:'#78716c',fontWeight:500 }}>Create and manage cleaning teams to assign to complaints</p>
        </div>
        <button onClick={openCreate} style={{ display:'inline-flex',alignItems:'center',gap:8,background:'#15803d',color:'#fff',padding:'11px 22px',borderRadius:100,fontSize:13,fontWeight:800,border:'none',cursor:'pointer',boxShadow:'0 4px 14px rgba(21,128,61,0.25)',transition:'all 0.2s',fontFamily:'inherit' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#166534';e.currentTarget.style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='#15803d';e.currentTarget.style.transform='none'}}
        >➕ Create Team</button>
      </div>

      {/* ── STAT TILES ── */}
      <div className="at-fade" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28 }}>
        {[
          { label:'Total',    value:teams.length,  icon:'👷', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
          { label:'Active',   value:activeCount,   icon:'✅', color:'#15803d', bg:'#f0fdf4', border:'#bbf7d0' },
          { label:'Inactive', value:inactiveCount, icon:'⏸️', color:'#78716c', bg:'#f5f5f4', border:'#e7e5e4' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:20,padding:'16px 12px',textAlign:'center' }}>
            <div style={{ fontSize:20,marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:'Fraunces,serif',fontSize:28,fontWeight:900,color:s.color,lineHeight:1,marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:11,color:'#a8a29e',fontWeight:700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── CREATE / EDIT FORM ── */}
      {showForm && (
        <div className="at-fade" style={{ background:'#fff',borderRadius:24,border:'1.5px solid #f0ede8',overflow:'hidden',marginBottom:28,boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Accent bar */}
          <div style={{ height:4,background:editingTeam ? 'linear-gradient(90deg,#2563eb,#7c3aed)' : 'linear-gradient(90deg,#15803d,#059669)' }} />
          <div style={{ padding:'28px 32px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
              <p style={{ fontFamily:'Fraunces,serif',fontSize:20,fontWeight:900,color:'#1c1917',letterSpacing:'-0.01em' }}>
                {editingTeam ? `✏️ Edit: ${editingTeam.name}` : '➕ Create New Team'}
              </p>
              <button onClick={closeForm} style={{ background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#a8a29e',padding:4,borderRadius:8,transition:'color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#1c1917'} onMouseLeave={e=>e.currentTarget.style.color='#a8a29e'}>✕</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Name + Size row */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
                <div>
                  <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>
                    Team Name 
                  </label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>👷</span>
                    <input type="text" name="name" value={form.name} onChange={handleFormChange}
                      placeholder="e.g. Green Warriors Team A" disabled={submitting}
                      className={`at-input ${formErrors.name ? 'error' : ''}`} />
                  </div>
                  {formErrors.name && <p style={{ color:'#ef4444',fontSize:12,fontWeight:700,marginTop:5 }}>{formErrors.name}</p>}
                </div>
                <div>
                  <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>
                    Team Size 
                  </label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>👥</span>
                    <input type="number" name="membersCount" value={form.membersCount} onChange={handleFormChange}
                      placeholder="e.g. 8" min="0" max="100" disabled={submitting}
                      className={`at-input ${formErrors.membersCount ? 'error' : ''}`} />
                  </div>
                  {formErrors.membersCount && <p style={{ color:'#ef4444',fontSize:12,fontWeight:700,marginTop:5 }}>{formErrors.membersCount}</p>}
                </div>
              </div>

              {/* contactEmail */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>
                  contactEmail
                </label>
                <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleFormChange}
                  placeholder="Enter contact email for this team"
                 disabled={submitting} className="at-textarea" />
              </div>

              {/* Buttons */}
              <div style={{ display:'flex',gap:10 }}>
                <button type="submit" disabled={submitting} style={{
                  flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  background: editingTeam ? '#2563eb' : '#15803d',
                  color:'#fff',border:'none',borderRadius:100,padding:'13px',
                  fontSize:14,fontWeight:800,cursor:submitting?'not-allowed':'pointer',
                  fontFamily:'inherit',transition:'all 0.2s',opacity:submitting?0.7:1,
                  boxShadow: editingTeam ? '0 4px 14px rgba(37,99,235,0.3)' : '0 4px 14px rgba(21,128,61,0.3)',
                }}>
                  {submitting ? <><Spinner />{editingTeam ? 'Saving...' : 'Creating...'}</> : <>{editingTeam ? '✏️ Save Changes' : '👷 Create Team'}</>}
                </button>
                <button type="button" onClick={closeForm} disabled={submitting} style={{ padding:'13px 24px',borderRadius:100,border:'1.5px solid #e7e5e4',background:'#fff',color:'#78716c',fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f5f5f4'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{ display:'flex',flexWrap:'wrap',gap:10,marginBottom:16 }}>
        <div style={{ position:'relative',flex:1,minWidth:200 }}>
          <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..." className="at-search" />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#a8a29e',fontWeight:800 }}>✕</button>
          )}
        </div>
        {/* Status tabs */}
        <div style={{ display:'flex',gap:4,background:'#fff',border:'1.5px solid #e7e5e4',borderRadius:100,padding:4 }}>
          {[
            { key:'all',      label:'All',      count:teams.length  },
            { key:'active',   label:'Active',   count:activeCount   },
            { key:'inactive', label:'Inactive', count:inactiveCount },
          ].map(t => (
            <button key={t.key} onClick={() => setStatusFilter(t.key)} className="at-tab"
              style={{ background:statusFilter===t.key ? '#15803d' : 'transparent', color:statusFilter===t.key ? '#fff' : '#78716c' }}>
              {t.label}
              <span style={{ fontSize:11,fontWeight:800,padding:'2px 6px',borderRadius:100,background:statusFilter===t.key ? 'rgba(255,255,255,0.25)' : '#f5f5f4',color:statusFilter===t.key ? '#fff' : '#a8a29e' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <p style={{ fontSize:13,color:'#a8a29e',fontWeight:700,marginBottom:20 }}>
          {filtered.length} team{filtered.length!==1?'s':''} found{search && <span style={{ color:'#78716c' }}> · "{search}"</span>}
        </p>
      )}

      {/* ── TEAMS GRID ── */}
      {loading ? (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="at-skeleton" style={{ height:200 }} />
          ))}
        </div>

      ) : filtered.length === 0 ? (
        <div style={{ background:'#fff',borderRadius:24,border:'1.5px solid #f0ede8',textAlign:'center',padding:'72px 32px' }}>
          <div style={{ fontSize:56,marginBottom:14 }}>{search ? '🔍' : '👷'}</div>
          <h3 style={{ fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:'#1c1917',marginBottom:8,letterSpacing:'-0.01em' }}>
            {search ? 'No teams found' : 'No teams yet'}
          </h3>
          <p style={{ fontSize:14,color:'#78716c',marginBottom:24,lineHeight:1.6 }}>
            {search ? `No results for "${search}"` : 'Create your first cleaning team to start assigning complaints.'}
          </p>
          {!search
            ? <button onClick={openCreate} style={{ background:'#15803d',color:'#fff',border:'none',borderRadius:100,padding:'12px 28px',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 14px rgba(21,128,61,0.25)',fontFamily:'inherit' }}>👷 Create First Team</button>
            : <button onClick={() => setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#15803d',fontSize:14,fontWeight:800,fontFamily:'inherit',textDecoration:'underline' }}>Clear Search</button>
          }
        </div>

      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16 }}>
          {filtered.map(team => {
            const isActive = team.active !== false
            return (
              <div key={team.id} className={`at-card ${isActive ? '' : 'inactive'}`}>
                {/* Accent strip */}
                <div style={{ height:4, background: isActive ? 'linear-gradient(90deg,#15803d,#059669)' : '#e7e5e4' }} />

                <div style={{ padding:'18px 20px',display:'flex',flexDirection:'column',flex:1 }}>
                  {/* Header */}
                  <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:12 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:12,minWidth:0 }}>
                      <div style={{ width:42,height:42,borderRadius:14,background:isActive?'#f0fdf4':'#f5f5f4',border:`1.5px solid ${isActive?'#bbf7d0':'#e7e5e4'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>
                        👷
                      </div>
                      <div style={{ minWidth:0 }}>
                        <h3 style={{ fontFamily:'Fraunces,serif',fontWeight:900,fontSize:15,color:'#1c1917',letterSpacing:'-0.01em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:4 }}>
                          {team.name}
                        </h3>
                        <span style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:800,padding:'3px 9px',borderRadius:100,background:isActive?'#f0fdf4':'#f5f5f4',color:isActive?'#15803d':'#a8a29e',border:`1px solid ${isActive?'#bbf7d0':'#e7e5e4'}` }}>
                          <span style={{ width:5,height:5,borderRadius:'50%',background:isActive?'#22c55e':'#d6d3d1' }} />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {team.membersCount != null && (
                      <div style={{ flexShrink:0,textAlign:'center',background:'#eff6ff',border:'1.5px solid #bfdbfe',borderRadius:12,padding:'8px 10px' }}>
                        <div style={{ fontFamily:'Fraunces,serif',fontSize:18,fontWeight:900,color:'#2563eb',lineHeight:1 }}>{team.membersCount}</div>
                        <div style={{ fontSize:10,color:'#93c5fd',fontWeight:700,marginTop:2 }}>members</div>
                      </div>
                    )}
                  </div>

                  {/* contactEmail */}
                  {team.contactEmail
                    ? <p style={{ fontSize:13,color:'#78716c',lineHeight:1.6,flex:1,marginBottom:16,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{team.contactEmail}</p>
                    : <p style={{ fontSize:12,color:'#d6d3d1',fontStyle:'italic',flex:1,marginBottom:16 }}>No contactEmail provided</p>
                  }

                  {/* Actions */}
                  <div style={{ display:'flex',gap:8,paddingTop:14,borderTop:'1.5px solid #f5f5f4' }}>
                    <button onClick={() => openEdit(team)} className="at-btn" style={{ flex:1,background:'#eff6ff',color:'#2563eb',borderColor:'#bfdbfe' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#dbeafe'} onMouseLeave={e=>e.currentTarget.style.background='#eff6ff'}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleToggleActive(team)} className="at-btn"
                      style={{ flex:1, background:isActive?'#fff7ed':'#f0fdf4', color:isActive?'#c2410c':'#15803d', borderColor:isActive?'#fdba74':'#bbf7d0' }}
                      onMouseEnter={e=>e.currentTarget.style.background=isActive?'#fed7aa':'#dcfce7'}
                      onMouseLeave={e=>e.currentTarget.style.background=isActive?'#fff7ed':'#f0fdf4'}>
                      {isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button onClick={() => setDeleteId(team.id)} className="at-btn" style={{ background:'#fff5f5',color:'#ef4444',borderColor:'#fca5a5',padding:'8px 12px' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'} onMouseLeave={e=>e.currentTarget.style.background='#fff5f5'}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── INFO BANNER ── */}
      {!loading && teams.length > 0 && (
        <div style={{ marginTop:28,background:'linear-gradient(135deg,#dcfce7,#d1fae5,#fef9c3)',border:'1.5px solid #bbf7d0',borderRadius:20,padding:'18px 22px',display:'flex',alignItems:'flex-start',gap:14 }}>
          <span style={{ fontSize:22,flexShrink:0 }}></span>
          <p style={{ fontSize:13,color:'#166534',fontWeight:600,lineHeight:1.6 }}>
            <strong>Tip:</strong> Deactivated teams won't appear in the assignment dropdown. Only active teams can be assigned to complaints.
          </p>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteId && (
        <div style={{ position:'fixed',inset:0,background:'rgba(28,25,23,0.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20 }}>
          <div style={{ background:'#fff',borderRadius:28,padding:'40px 36px',maxWidth:380,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.2)',border:'1.5px solid #f0ede8' }}>
            <div style={{ fontSize:52,marginBottom:16 }}>🗑️</div>
            <h3 style={{ fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,letterSpacing:'-0.01em',color:'#1c1917',marginBottom:10 }}>Delete Team?</h3>
            <p style={{ fontSize:14,color:'#78716c',lineHeight:1.7,marginBottom:28 }}>
              This team will be permanently removed. Complaints assigned to it will lose their team assignment.
            </p>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                style={{ flex:1,background:'#f5f5f4',border:'1.5px solid #e7e5e4',borderRadius:100,padding:13,fontSize:14,fontWeight:800,color:'#57534e',cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#ede9e6'} onMouseLeave={e=>e.currentTarget.style.background='#f5f5f4'}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex:1,background:'#ef4444',border:'none',borderRadius:100,padding:13,fontSize:14,fontWeight:800,color:'#fff',cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 14px rgba(239,68,68,0.3)',opacity:deleting?0.65:1 }}
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