import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import adminService from '../services/AdminService'
import StatusBadge from '../components/StatusBridge'
import { resolveCleanPreviewUrl } from '../components/AiResultCard'
import resolveAssetUrl from '../utils/resolveAssetUrl'

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']

const STATUS_CONFIG = {
  PENDING:     { icon: '⏳', label: 'Pending',     textColor: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  ASSIGNED:    { icon: '👥', label: 'Assigned',    textColor: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  IN_PROGRESS: { icon: '🔧', label: 'In Progress', textColor: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  RESOLVED:    { icon: '✅', label: 'Resolved',    textColor: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
}

const STATUS_TRANSITIONS = {
  PENDING:     ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
  ASSIGNED:    ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED:    [],
}

export default function AdminComplaintDetail() {
  const { id } = useParams()

  const [complaint,      setComplaint]      = useState(null)
  const [teams,          setTeams]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(false)
  const [imgError,       setImgError]       = useState(false)
  const [imgZoom,        setImgZoom]        = useState(false)
  const [aiImgError,     setAiImgError]     = useState(false)
  const [selectedTeam,   setSelectedTeam]   = useState('')
  const [assigning,      setAssigning]      = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deletingId,     setDeletingId]     = useState(null)
  const [deleting,       setDeleting]       = useState(false)
  const [toast,          setToast]          = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      adminService.getComplaintById(id),
      adminService.getAllTeams(),
    ])
      .then(([cr, tr]) => {
        setComplaint(cr.data?.data)
        setTeams((tr.data?.data || []).filter(t => t.active !== false))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [id])

  useEffect(() => {
    setImgError(false)
    setAiImgError(false)
  }, [id])

  // ✅ FIX 1: send complaintId + teamId together — backend AssignmentRequest needs both
  const handleAssign = async () => {
    if (!selectedTeam) { showToast('Please select a team', 'error'); return }
    setAssigning(true)
    try {
      await adminService.assignTeam(id, {
        complaintId: Number(id),
        teamId:      Number(selectedTeam),
      })
      showToast('Team assigned successfully ✅')
      setSelectedTeam('')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign team', 'error')
    } finally { setAssigning(false) }
  }

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true)
    try {
      await adminService.updateComplaintStatus(id, { status: newStatus })
      showToast(`Status updated to ${newStatus.replace('_', ' ')} ✅`)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error')
    } finally { setUpdatingStatus(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminService.deleteComplaint(id)
      showToast('Complaint deleted')
      setTimeout(() => window.history.back(), 1200)
    } catch {
      showToast('Failed to delete complaint', 'error')
      setDeleting(false)
      setDeletingId(null)
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={S.wrap}>
        <style>{CSS}</style>
        <div className="sk" style={{ height: 14, width: 130, marginBottom: 28 }} />
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div className="sk" style={{ height: 260, borderRadius: 0 }} />
          <div style={{ padding: '32px 36px' }}>
            <div className="sk" style={{ height: 22, width: '55%', marginBottom: 14 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="sk" style={{ height: 64, borderRadius: 16 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !complaint) {
    return (
      <div style={{ ...S.card, padding: '56px 40px', textAlign: 'center' }}>
        <style>{CSS}</style>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 900, color: '#1c1917', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Complaint Not Found
        </h2>
        <p style={{ color: '#78716c', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          This complaint may have been removed.
        </p>
        <Link to="/admin/complaints" className="btn-main">← Back to Complaints</Link>
      </div>
    )
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const statusCfg   = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.PENDING
  const currentStep = STATUS_STEPS.indexOf(complaint.status)
  const transitions = STATUS_TRANSITIONS[complaint.status] || []

  // ✅ FIX 2: aiSteps can be JSON string OR already an array — handle both
  let aiStepsList = []
  if (complaint.aiSteps) {
    if (Array.isArray(complaint.aiSteps)) {
      aiStepsList = complaint.aiSteps
    } else {
      try { aiStepsList = JSON.parse(complaint.aiSteps) } catch { aiStepsList = [complaint.aiSteps] }
    }
  }

  const aiImageUrl = resolveCleanPreviewUrl(complaint) || null

  const hasAi = aiStepsList.length > 0 || !!aiImageUrl

  const reportImageSrc =
    complaint.imageUrl || complaint.image_url
      ? resolveAssetUrl(complaint.imageUrl ?? complaint.image_url)
      : ''

  const createdDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null
  const createdTime = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.wrap}>
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 60,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px', borderRadius: 16,
          background: toast.type === 'error' ? '#ef4444' : '#15803d',
          color: '#fff', fontSize: 14, fontWeight: 700,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          animation: 'fadeUp 0.3s ease both',
          fontFamily: "'Nunito', sans-serif",
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      <Link to="/admin/complaints" className="back-link">
        <span>←</span> Back to Complaints
      </Link>

      {/* ── Main card ── */}
      <div style={{ ...S.card, overflow: 'hidden', marginBottom: 20 }}>

        {/* Hero image */}
        <div
          style={{
            position: 'relative', height: 280,
            background: 'linear-gradient(135deg, #d6d3d1, #a8a29e)',
            overflow: 'hidden',
            cursor: reportImageSrc && !imgError ? 'zoom-in' : 'default',
          }}
          onClick={() => reportImageSrc && !imgError && setImgZoom(true)}
        >
          {reportImageSrc && !imgError ? (
            <img
              src={reportImageSrc}
              alt={complaint.area}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
              <span style={{ fontSize: 96 }}>🏙️</span>
            </div>
          )}

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,25,23,0.75) 0%, rgba(28,25,23,0.1) 50%, transparent 100%)' }} />

          <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={complaint.status} />
            {hasAi && (
              <span style={{ background: 'rgba(124,58,237,0.88)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, background: '#c4b5fd', borderRadius: '50%', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                AI Analyzed
              </span>
            )}
          </div>

          <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 100 }}>
            #{complaint.id}
          </div>

          {reportImageSrc && !imgError && (
            <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100 }}>
              🔍 Click to zoom
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 32px' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', marginBottom: 6 }}>📍 REPORTED AREA</p>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {complaint.area}
            </h1>
          </div>
        </div>

        <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Status timeline */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <span style={S.tag}>🗺️ Complaint Timeline</span>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 2, background: '#f0ede8', zIndex: 0 }} />
              <div style={{
                position: 'absolute', top: 20, left: 20, height: 2,
                background: '#15803d', zIndex: 0, transition: 'width 0.7s ease',
                width: currentStep === 0 ? '0%' : `${(currentStep / (STATUS_STEPS.length - 1)) * 90}%`,
              }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between' }}>
                {STATUS_STEPS.map((step, i) => {
                  const cfg       = STATUS_CONFIG[step]
                  const isDone    = i < currentStep
                  const isCurrent = i === currentStep
                  return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', border: '2px solid',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, transition: 'all 0.3s',
                        background:  isDone ? '#15803d' : isCurrent ? cfg.bg    : '#fff',
                        borderColor: isDone ? '#15803d' : isCurrent ? cfg.border : '#e7e5e4',
                        color:       isDone ? '#fff'    : isCurrent ? cfg.textColor : '#d6d3d1',
                        boxShadow:   isCurrent ? `0 4px 16px ${cfg.border}` : isDone ? '0 4px 12px rgba(21,128,61,0.2)' : 'none',
                      }}>
                        {isDone ? '✓' : cfg.icon}
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 800, textAlign: 'center', lineHeight: 1.3, color: isDone ? '#15803d' : isCurrent ? cfg.textColor : '#d6d3d1' }}>
                        {cfg.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={S.tag}>📋 Complaint Details</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {createdDate && <InfoBox icon="📅" label="Reported On"   value={createdDate} sub={createdTime} />}
              <InfoBox icon="👤" label="Reported By"    value={complaint.userName  || '—'}       sub={complaint.userEmail} />
              <InfoBox icon={statusCfg.icon} label="Current Status" value={statusCfg.label}      accent={statusCfg.textColor} />
              {/* ✅ FIX 4: teamName comes from complaint object after fetchData refresh */}
              <InfoBox
                icon="👥"
                label="Assigned Team"
                value={complaint.teamName || 'Not assigned yet'}
                accent={complaint.teamName ? '#1d4ed8' : '#a8a29e'}
              />
              <InfoBox icon={hasAi ? '🤖' : '⏳'} label="AI Analysis" value={hasAi ? 'Completed' : 'Not available'} accent={hasAi ? '#7c3aed' : '#a8a29e'} />
              <InfoBox icon="🔢" label="Complaint ID"   value={`#${complaint.id}`}               accent="#57534e" />
            </div>
          </div>

          {/* Admin actions */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ ...S.tag, background: '#fef9c3', borderColor: '#fde68a', color: '#92400e' }}>⚙️ Admin Actions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {complaint.status !== 'RESOLVED' && (
                <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 20, padding: '20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1d4ed8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span>👥</span>
                    {complaint.teamName
                      ? `Reassign Team (current: ${complaint.teamName})`
                      : 'Assign Cleaning Team'}
                  </p>
                  {teams.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>
                      <span>⚠️</span>
                      <span>No active teams. <Link to="/admin/teams" style={{ fontWeight: 800, color: '#1d4ed8' }}>Create a team →</Link></span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <select
                        value={selectedTeam}
                        onChange={e => setSelectedTeam(e.target.value)}
                        disabled={assigning}
                        className="admin-select"
                        style={{ flex: 1 }}
                      >
                        <option value="">Select a team...</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name}{t.memberCount ? ` (${t.memberCount} members)` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssign}
                        disabled={assigning || !selectedTeam}
                        className="btn-action-blue"
                      >
                        {assigning ? <Spinner /> : '✓'} Assign
                      </button>
                    </div>
                  )}
                </div>
              )}

              {transitions.length > 0 && (
                <div style={{ background: '#fafaf8', border: '1.5px solid #f0ede8', borderRadius: 20, padding: '20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#57534e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span>🔄</span> Update Status
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {transitions.map(s => {
                      const cfg = STATUS_CONFIG[s]
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(s)}
                          disabled={updatingStatus}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '10px 20px', borderRadius: 100, fontWeight: 800, fontSize: 13,
                            background: cfg.bg, border: `1.5px solid ${cfg.border}`, color: cfg.textColor,
                            cursor: updatingStatus ? 'not-allowed' : 'pointer',
                            opacity: updatingStatus ? 0.5 : 1,
                            transition: 'all 0.2s', fontFamily: "'Nunito', sans-serif",
                          }}
                        >
                          {updatingStatus ? <Spinner color={cfg.textColor} /> : cfg.icon}
                          Mark as {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {complaint.status === 'RESOLVED' && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 28 }}>🎉</span>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14, color: '#15803d', marginBottom: 3 }}>Complaint Resolved!</p>
                    <p style={{ fontSize: 13, color: '#15803d', opacity: 0.75 }}>This area has been cleaned. Great work!</p>
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1.5px solid #f0ede8', paddingTop: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#a8a29e', letterSpacing: '0.08em', marginBottom: 12 }}>DANGER ZONE</p>
                <button
                  onClick={() => setDeletingId(complaint.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff5f5', border: '1.5px solid #fca5a5', color: '#ef4444', padding: '10px 20px', borderRadius: 100, fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Nunito', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5' }}
                >
                  🗑️ Delete This Complaint
                </button>
              </div>
            </div>
          </div>

          {/* AI Results */}
          {hasAi ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ ...S.tag, background: '#f5f3ff', borderColor: '#e9d5ff', color: '#7c3aed' }}>🤖 AI Analysis Results</span>
              </div>
              <div style={{ background: '#f5f3ff', border: '1.5px solid #e9d5ff', borderRadius: 20, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Steps */}
                {aiStepsList.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.06em', marginBottom: 12 }}>🧹 CLEANING PLAN</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {aiStepsList.map((step, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '12px 14px', borderRadius: 12,
                            background: '#fff', border: '1.5px solid #e9d5ff',
                          }}
                        >
                          <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: 13, color: '#3b0764', lineHeight: 1.6, fontWeight: 500 }}>
                            {typeof step === 'object' ? (step.step || step.description || JSON.stringify(step)) : step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ FIX 5: DALL·E clean image preview */}
                {aiImageUrl && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.06em', marginBottom: 12 }}>🎨 DALL·E 3 CLEAN VISION</p>
                    {!aiImgError ? (
                      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1.5px solid #e9d5ff' }}>
                        <img
                          src={aiImageUrl}
                          alt="AI generated clean version"
                          onError={() => setAiImgError(true)}
                          style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(to top, rgba(91,33,182,0.7), transparent)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                          🤖 AI-generated clean vision of this area
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#fff', border: '1.5px solid #e9d5ff', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28 }}>🖼️</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed', marginBottom: 4 }}>Image preview unavailable</p>
                          <a href={aiImageUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#7c3aed', textDecoration: 'underline', wordBreak: 'break-all' }}>
                            Open AI image in new tab →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: '#f5f3ff', border: '1.5px solid #e9d5ff', borderRadius: 20, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
              <p style={{ fontWeight: 800, fontSize: 14, color: '#7c3aed', marginBottom: 6 }}>No AI Analysis Available</p>
              <p style={{ fontSize: 13, color: '#a78bfa', lineHeight: 1.6 }}>AI results are generated when a complaint is first submitted by a citizen.</p>
            </div>
          )}

        </div>
      </div>

      {/* Image zoom modal */}
      {imgZoom && (
        <div
          onClick={() => setImgZoom(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.92)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}
        >
          <button
            onClick={() => setImgZoom(false)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
          >✕</button>
          <img
            src={reportImageSrc}
            alt={complaint.area}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.5)', objectFit: 'contain' }}
          />
          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, whiteSpace: 'nowrap' }}>
            {complaint.area}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 28, padding: '44px 40px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', border: '1.5px solid #f0ede8' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', color: '#1c1917', marginBottom: 10 }}>Delete Complaint?</h3>
            <p style={{ fontSize: 14, color: '#78716c', lineHeight: 1.7, marginBottom: 28 }}>
              This will permanently remove the complaint and all associated AI data. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                style={{ flex: 1, background: '#f5f5f4', border: '1.5px solid #e7e5e4', borderRadius: 100, padding: 13, fontSize: 14, fontWeight: 800, color: '#57534e', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ede9e6' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f4' }}
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, background: '#ef4444', border: 'none', borderRadius: 100, padding: 13, fontSize: 14, fontWeight: 800, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.6 : 1, boxShadow: '0 4px 14px rgba(239,68,68,0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = '#dc2626' }}
                onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = '#ef4444' }}
              >
                {deleting ? <Spinner color="#fff" /> : '🗑️'} Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner({ color = '#fff' }) {
  return (
    <svg style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
      <path d="M4 12a8 8 0 018-8" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ── InfoBox ────────────────────────────────────────────────────────────────────
function InfoBox({ icon, label, value, sub, accent = '#1c1917' }) {
  return (
    <div style={{ background: '#fafaf8', borderRadius: 16, padding: '14px 16px', border: '1.5px solid #f0ede8' }}>
      <p style={{ fontSize: 11, color: '#a8a29e', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>{icon}</span> {label.toUpperCase()}
      </p>
      <p style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.4, color: accent }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 3, fontWeight: 600 }}>{sub}</p>}
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const S = {
  wrap: { fontFamily: "'Nunito', 'DM Sans', sans-serif", color: '#1c1917' },
  card: { background: '#fff', borderRadius: 24, border: '1.5px solid #f3f4f6', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  tag:  { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#15803d', padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', border: '1.5px solid #bbf7d0' },
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer   { 0%,100%{opacity:1} 50%{opacity:0.45} }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  .sk { background:#e7e5e4; border-radius:8px; animation:shimmer 1.4s ease-in-out infinite; display:block; }
  .back-link { display:inline-flex; align-items:center; gap:6px; color:#15803d; text-decoration:none; font-size:14px; font-weight:700; margin-bottom:24px; transition:all 0.2s; }
  .back-link:hover { color:#166534; gap:8px; }
  .btn-main { background:#15803d; color:#fff; padding:12px 24px; border-radius:100px; font-size:14px; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:all 0.25s; box-shadow:0 6px 20px rgba(21,128,61,0.22); font-family:inherit; cursor:pointer; border:none; }
  .btn-main:hover { background:#166534; transform:translateY(-2px); }
  .btn-action-blue { display:inline-flex; align-items:center; gap:7px; background:#1d4ed8; color:#fff; padding:10px 20px; border-radius:100px; font-size:13px; font-weight:800; border:none; cursor:pointer; transition:all 0.2s; font-family:inherit; box-shadow:0 4px 12px rgba(29,78,216,0.25); white-space:nowrap; }
  .btn-action-blue:hover { background:#1e40af; transform:translateY(-1px); }
  .btn-action-blue:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
  .admin-select { border:1.5px solid #bfdbfe; border-radius:14px; padding:10px 14px; font-size:13px; font-family:inherit; font-weight:600; color:#1c1917; background:#fff; outline:none; transition:all 0.2s; }
  .admin-select:focus { border-color:#1d4ed8; box-shadow:0 0 0 3px rgba(29,78,216,0.1); }
  .admin-select:disabled { opacity:0.5; }
`