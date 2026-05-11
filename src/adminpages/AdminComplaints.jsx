import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../services/AdminService'
import StatusBadge from '../components/StatusBridge'

const STATUS_OPTIONS = ['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']

const STATUS_CONFIG = {
  ALL:         { label: 'All',         icon: '📋', hex: '#57534e',  activeBg: '#1c1917' },
  PENDING:     { label: 'Pending',     icon: '⏳', hex: '#d97706',  activeBg: '#d97706' },
  ASSIGNED:    { label: 'Assigned',    icon: '👥', hex: '#2563eb',  activeBg: '#2563eb' },
  IN_PROGRESS: { label: 'In Progress', icon: '🔧', hex: '#ea580c',  activeBg: '#ea580c' },
  RESOLVED:    { label: 'Resolved',    icon: '✅', hex: '#15803d',  activeBg: '#15803d' },
}

const STATUS_TRANSITIONS = {
  PENDING:     ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
  ASSIGNED:    ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED:    [],
}

const TRANSITION_STYLE = {
  ASSIGNED:    { bg:'#eff6ff', hover:'#dbeafe', color:'#1d4ed8', border:'#bfdbfe' },
  IN_PROGRESS: { bg:'#fff7ed', hover:'#fed7aa', color:'#c2410c', border:'#fdba74' },
  RESOLVED:    { bg:'#f0fdf4', hover:'#dcfce7', color:'#15803d', border:'#bbf7d0' },
}

export default function AdminComplaints() {
  const [complaints, setComplaints]   = useState([])
  const [teams, setTeams]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('ALL')
  const [search, setSearch]           = useState('')
  const [sortBy, setSortBy]           = useState('newest')
  const [page, setPage]               = useState(1)
  const [toast, setToast]             = useState(null)
  const [assigningId, setAssigningId] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState({})
  const [updatingId, setUpdatingId]   = useState(null)
  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)

  const PER_PAGE = 10

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = useCallback(() => {
    setLoading(true)
    Promise.all([adminService.getAllComplaints(), adminService.getAllTeams()])
      .then(([cr, tr]) => {
        setComplaints(cr.data?.data || [])
        setTeams((tr.data?.data || []).filter(t => t.active !== false))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const counts = {
    ALL:         complaints.length,
    PENDING:     complaints.filter(c => c.status === 'PENDING').length,
    ASSIGNED:    complaints.filter(c => c.status === 'ASSIGNED').length,
    IN_PROGRESS: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    RESOLVED:    complaints.filter(c => c.status === 'RESOLVED').length,
  }

  const filtered = complaints
    .filter(c => filter === 'ALL' || c.status === filter)
    .filter(c =>
      !search.trim() ||
      c.area?.toLowerCase().includes(search.toLowerCase()) ||
      c.userName?.toLowerCase().includes(search.toLowerCase()) ||
      c.userEmail?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'status') {
        const order = { PENDING:0, ASSIGNED:1, IN_PROGRESS:2, RESOLVED:3 }
        return (order[a.status]??9) - (order[b.status]??9)
      }
      return 0
    })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  useEffect(() => setPage(1), [filter, search, sortBy])

  const handleAssign = async (complaintId) => {
    const teamId = selectedTeam[complaintId]
    if (!teamId) { showToast('Please select a team first', 'error'); return }
    setAssigningId(complaintId)
    try {
      await adminService.assignTeam(complaintId, { teamId: Number(teamId) })
      showToast('Team assigned successfully 👥')
      setSelectedTeam(prev => ({ ...prev, [complaintId]: '' }))
      fetchAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign team', 'error')
    } finally { setAssigningId(null) }
  }

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdatingId(complaintId)
    try {
      await adminService.updateComplaintStatus(complaintId, { status: newStatus })
      showToast(`Status updated to ${newStatus.replace('_', ' ')} ✅`)
      fetchAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error')
    } finally { setUpdatingId(null) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await adminService.deleteComplaint(deleteId)
      showToast('Complaint deleted')
      setDeleteId(null)
      fetchAll()
    } catch {
      showToast('Failed to delete complaint', 'error')
    } finally { setDeleting(false) }
  }

  const Spinner = () => (
    <svg style={{ width:14,height:14,animation:'spin 0.7s linear infinite' }} fill="none" viewBox="0 0 24 24">
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

        .ac-fade { animation: fadeUp 0.5s ease both; }

        .ac-skeleton {
          background: linear-gradient(90deg,#f5f5f4 25%,#ede9e6 50%,#f5f5f4 75%);
          background-size: 400px 100%; animation: shimmer 1.4s ease infinite; border-radius: 10px;
        }

        .ac-filter-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 100px;
          font-size: 13px; font-weight: 800; border: 1.5px solid #e7e5e4;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
          background: #fff; color: #78716c;
        }
        .ac-filter-btn:hover { border-color: #bbf7d0; background: #f0fdf4; color: #15803d; }
        .ac-filter-btn.active { border-color: transparent; color: #fff; }

        .ac-search {
          width: 100%; border: 1.5px solid #e7e5e4; border-radius: 14px;
          padding: 11px 38px 11px 40px; font-size: 14px; font-family: inherit;
          font-weight: 600; color: #1c1917; background: #fff; outline: none; transition: all 0.2s;
        }
        .ac-search::placeholder { color: #a8a29e; font-weight: 500; }
        .ac-search:focus { border-color: #15803d; box-shadow: 0 0 0 4px rgba(21,128,61,0.08); }

        .ac-select {
          border: 1.5px solid #e7e5e4; border-radius: 100px;
          padding: 9px 16px; font-size: 13px; font-weight: 700;
          font-family: inherit; color: #57534e; background: #fff;
          outline: none; cursor: pointer;
        }
        .ac-select:focus { border-color: #15803d; }

        .ac-card {
          background: #fff; border-radius: 20px; border: 1.5px solid #f0ede8;
          overflow: hidden; transition: all 0.25s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .ac-card:hover { box-shadow: 0 10px 32px rgba(0,0,0,0.08); border-color: #e7e5e4; }

        .ac-action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 12px; border-radius: 100px;
          font-size: 12px; font-weight: 800; border: 1.5px solid;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .ac-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ac-assign-select {
          border: 1.5px solid #e7e5e4; border-radius: 10px;
          padding: 7px 10px; font-size: 12px; font-weight: 700;
          font-family: inherit; color: #57534e; background: #fff;
          outline: none; max-width: 150px;
        }
        .ac-assign-select:focus { border-color: #2563eb; }

        .ac-assign-btn {
          display: inline-flex; align-items: center; gap: 5px;
          background: #2563eb; color: #fff; border: none;
          padding: 7px 14px; border-radius: 100px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          font-family: inherit; transition: all 0.2s;
        }
        .ac-assign-btn:hover:not(:disabled) { background: #1d4ed8; }
        .ac-assign-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ac-delete-btn {
          margin-left: auto; background: #fff5f5; border: 1.5px solid #fca5a5;
          color: #ef4444; padding: 7px 12px; border-radius: 100px;
          font-size: 12px; font-weight: 800; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .ac-delete-btn:hover { background: #fef2f2; }

        .ac-page-btn {
          min-width: 36px; height: 36px; border-radius: 100px;
          font-size: 13px; font-weight: 800; border: 1.5px solid #e7e5e4;
          background: #fff; color: #78716c; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0 10px; transition: all 0.2s; font-family: inherit;
        }
        .ac-page-btn:hover:not(:disabled) { border-color: #bbf7d0; background: #f0fdf4; color: #15803d; }
        .ac-page-btn.active { background: #15803d; border-color: #15803d; color: #fff; box-shadow: 0 4px 10px rgba(21,128,61,0.25); }
        .ac-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .ac-toast { animation: toastIn 0.3s ease both; }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div className="ac-toast" style={{
          position:'fixed', top:20, right:20, zIndex:100,
          display:'flex', alignItems:'center', gap:10,
          padding:'13px 20px', borderRadius:16,
          background: toast.type === 'error' ? '#ef4444' : '#15803d',
          color:'#fff', fontSize:13, fontWeight:800,
          boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="ac-fade" style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:28 }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:100, padding:'5px 14px', marginBottom:12 }}>
            <span style={{ width:7, height:7, background:'#22c55e', borderRadius:'50%' }} />
            <span style={{ fontSize:11, fontWeight:800, color:'#15803d', letterSpacing:'0.06em' }}>ADMIN</span>
          </div>
          <h1 style={{ fontFamily:'Fraunces,serif', fontSize:'clamp(22px,3vw,32px)', fontWeight:900, letterSpacing:'-0.02em', color:'#1c1917', marginBottom:6, lineHeight:1.1 }}>
            Manage <span style={{ color:'#15803d', fontStyle:'italic' }}>Complaints</span>
          </h1>
          <p style={{ fontSize:14, color:'#78716c', fontWeight:500 }}>Review, assign teams and update complaint statuses</p>
        </div>
        <button onClick={fetchAll} style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#fff', border:'1.5px solid #e7e5e4', borderRadius:100, padding:'10px 20px', fontSize:13, fontWeight:800, color:'#57534e', cursor:'pointer', transition:'all 0.2s', fontFamily:'inherit' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#bbf7d0';e.currentTarget.style.color='#15803d'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#e7e5e4';e.currentTarget.style.color='#57534e'}}
        >Refresh</button>
      </div>

      {/* ── FILTER PILLS ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
        {STATUS_OPTIONS.map(s => {
          const cfg    = STATUS_CONFIG[s]
          const count  = counts[s]
          const active = filter === s
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`ac-filter-btn ${active ? 'active' : ''}`}
              style={ active ? { background:cfg.activeBg, borderColor:cfg.activeBg } : {} }
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
              <span style={{ fontSize:11, fontWeight:800, padding:'2px 7px', borderRadius:100,
                background: active ? 'rgba(255,255,255,0.25)' : '#f5f5f4',
                color: active ? '#fff' : '#a8a29e' }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, pointerEvents:'none' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by area, user name or email..." className="ac-search" />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#a8a29e',fontWeight:800 }}>✕</button>
          )}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="ac-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="status">By Status</option>
        </select>
      </div>

      {/* Result count */}
      {!loading && (
        <p style={{ fontSize:13, color:'#a8a29e', fontWeight:700, marginBottom:20 }}>
          Showing {paginated.length} of {filtered.length} complaints
          {filter !== 'ALL' && <span style={{ color:'#78716c' }}> · {STATUS_CONFIG[filter].label}</span>}
          {search && <span style={{ color:'#78716c' }}> · "{search}"</span>}
        </p>
      )}

      {/* ── COMPLAINTS ── */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ background:'#fff', borderRadius:20, border:'1.5px solid #f0ede8', padding:20, display:'flex', gap:14 }}>
              <div className="ac-skeleton" style={{ width:60,height:60,borderRadius:12,flexShrink:0 }} />
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:9 }}>
                <div className="ac-skeleton" style={{ height:14,width:'45%' }} />
                <div className="ac-skeleton" style={{ height:11,width:'30%' }} />
                <div className="ac-skeleton" style={{ height:11,width:'60%' }} />
              </div>
              <div className="ac-skeleton" style={{ width:80,height:30,borderRadius:100 }} />
            </div>
          ))}
        </div>

      ) : paginated.length === 0 ? (
        <div style={{ background:'#fff', borderRadius:24, border:'1.5px solid #f0ede8', textAlign:'center', padding:'72px 32px' }}>
          <div style={{ fontSize:56, marginBottom:14 }}>{search ? '🔍' : '📭'}</div>
          <h3 style={{ fontFamily:'Fraunces,serif', fontSize:24, fontWeight:900, color:'#1c1917', marginBottom:8, letterSpacing:'-0.01em' }}>
            {search ? 'No complaints found' : 'No complaints yet'}
          </h3>
          <p style={{ fontSize:14, color:'#78716c', marginBottom:20 }}>
            {search ? `No results for "${search}"` : 'Complaints will appear here once citizens report issues.'}
          </p>
          {(search || filter !== 'ALL') && (
            <button onClick={() => { setSearch(''); setFilter('ALL') }}
              style={{ background:'#15803d', color:'#fff', border:'none', borderRadius:100, padding:'10px 24px', fontSize:13, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 14px rgba(21,128,61,0.25)', fontFamily:'inherit' }}>
              Clear Filters
            </button>
          )}
        </div>

      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {paginated.map(c => {
            const isAssigning = assigningId === c.id
            const isUpdating  = updatingId  === c.id
            const transitions = STATUS_TRANSITIONS[c.status] || []
            const createdDate = c.createdAt
              ? new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
              : ''

            return (
              <div key={c.id} className="ac-card">
                <div style={{ display:'flex' }}>
                  {/* Thumbnail */}
                  <div style={{ width:80, flexShrink:0, background:'#f0fdf4', overflow:'hidden', minHeight:88 }}>
                    {c.imageUrl
                      ? <img src={`http://localhost:8084${c.imageUrl}`} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',minHeight:88 }} />
                      : <div style={{ width:'100%',minHeight:88,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,opacity:0.3 }}>🏙️</div>
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex:1, padding:'14px 18px', minWidth:0 }}>
                    {/* Top row */}
                    <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:8 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:6, marginBottom:4 }}>
                          <StatusBadge status={c.status} />
                          {c.aiSteps && (
                            <span style={{ background:'#f5f3ff', color:'#7c3aed', fontSize:11, fontWeight:800, padding:'3px 8px', borderRadius:100, border:'1px solid #e9d5ff' }}>
                              AI Ready
                            </span>
                          )}
                          <span style={{ fontSize:11, color:'#d6d3d1', fontWeight:700 }}>#{c.id}</span>
                        </div>
                        <p style={{ fontWeight:800, fontSize:14, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.area}</p>
                      </div>
                      <Link to={`/admin/complaints/${c.id}`} style={{ fontSize:12, fontWeight:800, color:'#15803d', textDecoration:'none', flexShrink:0, border:'1.5px solid #bbf7d0', borderRadius:100, padding:'5px 12px', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='#f0fdf4'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}
                      >View →</Link>
                    </div>

                    {/* Meta */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:12 }}>
                      {c.userName  && <span style={{ fontSize:11,color:'#a8a29e',fontWeight:600 }}>👤 {c.userName}</span>}
                      {c.userEmail && <span style={{ fontSize:11,color:'#a8a29e',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',maxWidth:180 }}>📧 {c.userEmail}</span>}
                      {createdDate && <span style={{ fontSize:11,color:'#a8a29e',fontWeight:600 }}>📅 {createdDate}</span>}
                      {c.teamName  && <span style={{ fontSize:11,color:'#2563eb',fontWeight:700 }}>👥 {c.teamName}</span>}
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8 }}>

                      {/* Assign team */}
                      {c.status !== 'RESOLVED' && teams.length > 0 && (
                        <>
                          <select value={selectedTeam[c.id] || ''} onChange={e => setSelectedTeam(prev => ({ ...prev, [c.id]: e.target.value }))}
                            disabled={isAssigning} className="ac-assign-select">
                            <option value="">👥 Select Team</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <button onClick={() => handleAssign(c.id)} disabled={isAssigning || !selectedTeam[c.id]} className="ac-assign-btn">
                            {isAssigning ? <Spinner /> : '✓'} Assign
                          </button>
                        </>
                      )}

                      {/* Status transitions */}
                      {transitions.map(s => {
                        const ts = TRANSITION_STYLE[s]
                        return (
                          <button key={s} onClick={() => handleStatusUpdate(c.id, s)} disabled={isUpdating}
                            className="ac-action-btn"
                            style={{ background:ts.bg, color:ts.color, borderColor:ts.border }}
                            onMouseEnter={e=>e.currentTarget.style.background=ts.hover}
                            onMouseLeave={e=>e.currentTarget.style.background=ts.bg}
                          >
                            {isUpdating && updatingId === c.id ? <Spinner /> : STATUS_CONFIG[s]?.icon}
                            {s.replace('_', ' ')}
                          </button>
                        )
                      })}

                      {/* Delete */}
                      <button onClick={() => setDeleteId(c.id)} className="ac-delete-btn">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:32 }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="ac-page-btn">← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, i, arr) => { if (i > 0 && arr[i-1] !== p-1) acc.push('...'); acc.push(p); return acc }, [])
            .map((p, i) => p === '...'
              ? <span key={`d${i}`} style={{ color:'#a8a29e', fontSize:13, padding:'0 4px' }}>…</span>
              : <button key={p} onClick={() => setPage(p)} className={`ac-page-btn ${page===p?'active':''}`}>{p}</button>
            )}
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="ac-page-btn">Next →</button>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(28,25,23,0.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }}>
          <div style={{ background:'#fff', borderRadius:28, padding:'40px 36px', maxWidth:380, width:'100%', textAlign:'center', boxShadow:'0 24px 80px rgba(0,0,0,0.2)', border:'1.5px solid #f0ede8' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🗑️</div>
            <h3 style={{ fontFamily:'Fraunces,serif', fontSize:24, fontWeight:900, letterSpacing:'-0.01em', color:'#1c1917', marginBottom:10 }}>Delete Complaint?</h3>
            <p style={{ fontSize:14, color:'#78716c', lineHeight:1.7, marginBottom:28 }}>
              This will permanently remove the complaint and its AI data.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                style={{ flex:1, background:'#f5f5f4', border:'1.5px solid #e7e5e4', borderRadius:100, padding:'13px', fontSize:14, fontWeight:800, color:'#57534e', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#ede9e6'}
                onMouseLeave={e=>e.currentTarget.style.background='#f5f5f4'}
              >Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex:1, background:'#ef4444', border:'none', borderRadius:100, padding:'13px', fontSize:14, fontWeight:800, color:'#fff', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(239,68,68,0.3)', opacity:deleting?0.65:1 }}
                onMouseEnter={e=>!deleting&&(e.currentTarget.style.background='#dc2626')}
                onMouseLeave={e=>e.currentTarget.style.background='#ef4444'}
              >
                {deleting ? <Spinner /> : ''} Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}