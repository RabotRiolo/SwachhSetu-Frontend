import { useState, useEffect, useRef } from 'react'
import adminService from '../services/AdminService'

const EMPTY_FORM = { title: '', author: '', content: '', coverImage: '' }

export default function AdminArticles() {
  const [articles, setArticles]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [showForm, setShowForm]           = useState(false)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]       = useState({})
  const [submitting, setSubmitting]       = useState(false)
  const [deleteId, setDeleteId]           = useState(null)
  const [deleting, setDeleting]           = useState(false)
  const [search, setSearch]               = useState('')
  const [sortBy, setSortBy]               = useState('newest')
  const [toast, setToast]                 = useState(null)
  const [imgPreviewError, setImgPreviewError] = useState(false)
  const formRef = useRef(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const fetchArticles = () => {
    setLoading(true)
    adminService.getAllArticles()
      .then(r => setArticles(r.data?.data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchArticles() }, [])

  const filtered = articles
    .filter(a => !search.trim() || a.title?.toLowerCase().includes(search.toLowerCase()) || a.author?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.publishedAt) - new Date(a.publishedAt)
      if (sortBy === 'oldest') return new Date(a.publishedAt) - new Date(b.publishedAt)
      if (sortBy === 'title')  return a.title?.localeCompare(b.title)
      if (sortBy === 'author') return a.author?.localeCompare(b.author)
      return 0
    })

  const now = new Date()
  const thisMonthCount = articles.filter(a => {
    const d = new Date(a.publishedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const authorCount = new Set(articles.map(a => a.author).filter(Boolean)).size

  const validate = () => {
    const errs = {}
    if (!form.title.trim())   errs.title   = 'Title is required'
    if (!form.author.trim())  errs.author  = 'Author name is required'
    if (!form.content.trim()) errs.content = 'Content is required'
    else if (form.content.trim().length < 50) errs.content = 'Content must be at least 50 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      await adminService.createArticle({ title: form.title.trim(), author: form.author.trim(), content: form.content.trim(), coverImage: form.coverImage.trim() || null })
      showToast('Article published successfully! 📰')
      setForm(EMPTY_FORM); setFormErrors({}); setShowForm(false); fetchArticles()
    } catch (err) { showToast(err.response?.data?.message || 'Failed to publish article', 'error') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await adminService.deleteArticle(deleteId); showToast('Article deleted'); setDeleteId(null); fetchArticles() }
    catch { showToast('Failed to delete article', 'error') }
    finally { setDeleting(false) }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
    if (name === 'coverImage') setImgPreviewError(false)
  }

  const openForm = () => {
    setForm(EMPTY_FORM); setFormErrors({}); setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0
  const readTime  = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0

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
        .aa-fade { animation: fadeUp 0.5s ease both; }
        .aa-skeleton {
          background: linear-gradient(90deg,#f5f5f4 25%,#ede9e6 50%,#f5f5f4 75%);
          background-size:400px 100%; animation:shimmer 1.4s ease infinite; border-radius:14px;
        }
        .aa-input {
          width:100%; border:1.5px solid #e7e5e4; border-radius:12px;
          padding:11px 14px 11px 40px; font-size:14px; font-weight:600;
          font-family:inherit; color:#1c1917; background:#fff; outline:none; transition:all 0.2s; box-sizing:border-box;
        }
        .aa-input.no-icon { padding-left:14px; }
        .aa-input::placeholder { color:#a8a29e; font-weight:500; }
        .aa-input:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .aa-input.error { border-color:#fca5a5; background:#fff5f5; }
        .aa-textarea {
          width:100%; border:1.5px solid #e7e5e4; border-radius:14px;
          padding:14px; font-size:14px; font-weight:600; font-family:'Courier New',monospace;
          color:#1c1917; background:#fff; outline:none; resize:vertical; transition:all 0.2s;
          box-sizing:border-box; line-height:1.8;
        }
        .aa-textarea::placeholder { color:#a8a29e; font-weight:400; font-family:'Nunito',sans-serif; }
        .aa-textarea:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .aa-textarea.error { border-color:#fca5a5; background:#fff5f5; }
        .aa-search {
          width:100%; border:1.5px solid #e7e5e4; border-radius:100px;
          padding:10px 36px 10px 40px; font-size:14px; font-weight:600;
          font-family:inherit; color:#1c1917; background:#fff; outline:none; transition:all 0.2s;
        }
        .aa-search::placeholder { color:#a8a29e; font-weight:500; }
        .aa-search:focus { border-color:#15803d; box-shadow:0 0 0 4px rgba(21,128,61,0.08); }
        .aa-select {
          border:1.5px solid #e7e5e4; border-radius:100px; padding:10px 16px;
          font-size:13px; font-weight:700; font-family:inherit;
          color:#57534e; background:#fff; outline:none; cursor:pointer;
        }
        .aa-select:focus { border-color:#15803d; }
        .aa-card {
          background:#fff; border-radius:22px; border:1.5px solid #f0ede8;
          overflow:hidden; transition:all 0.25s; box-shadow:0 2px 8px rgba(0,0,0,0.03);
        }
        .aa-card:hover { box-shadow:0 12px 36px rgba(0,0,0,0.08); border-color:#e7e5e4; transform:translateY(-2px); }
        .aa-toast { animation: toastIn 0.3s ease both; }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div className="aa-toast" style={{ position:'fixed',top:20,right:20,zIndex:100,display:'flex',alignItems:'center',gap:10,padding:'13px 20px',borderRadius:16,background:toast.type==='error'?'#ef4444':'#15803d',color:'#fff',fontSize:13,fontWeight:800,boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>{toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="aa-fade" style={{ display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'flex-start',gap:16,marginBottom:28 }}>
        <div>
          <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:100,padding:'5px 14px',marginBottom:12 }}>
            <span style={{ width:7,height:7,background:'#22c55e',borderRadius:'50%' }} />
            <span style={{ fontSize:11,fontWeight:800,color:'#15803d',letterSpacing:'0.06em' }}>ARTICLES</span>
          </div>
          <h1 style={{ fontFamily:'Fraunces,serif',fontSize:'clamp(22px,3vw,32px)',fontWeight:900,letterSpacing:'-0.02em',color:'#1c1917',marginBottom:6,lineHeight:1.1 }}>
            Manage <span style={{ color:'#15803d',fontStyle:'italic' }}>Articles</span>
          </h1>
          <p style={{ fontSize:14,color:'#78716c',fontWeight:500 }}>Publish and manage cleanliness awareness articles</p>
        </div>
        <button onClick={openForm} style={{ display:'inline-flex',alignItems:'center',gap:8,background:'#15803d',color:'#fff',padding:'11px 22px',borderRadius:100,fontSize:13,fontWeight:800,border:'none',cursor:'pointer',boxShadow:'0 4px 14px rgba(21,128,61,0.25)',transition:'all 0.2s',fontFamily:'inherit' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#166534';e.currentTarget.style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='#15803d';e.currentTarget.style.transform='none'}}
        >✏️ Write Article</button>
      </div>

      {/* ── STAT TILES ── */}
      <div className="aa-fade" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12,marginBottom:28 }}>
        {[
          { label:'Total',      value:articles.length, icon:'📰', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
          { label:'Authors',    value:authorCount,     icon:'✍️', color:'#7c3aed', bg:'#f5f3ff', border:'#e9d5ff' },
          { label:'This Month', value:thisMonthCount,  icon:'📅', color:'#15803d', bg:'#f0fdf4', border:'#bbf7d0' },
          { label:'Showing',    value:filtered.length, icon:'🔍', color:'#78716c', bg:'#f5f5f4', border:'#e7e5e4' },
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
        <div ref={formRef} className="aa-fade" style={{ background:'#fff',borderRadius:24,border:'1.5px solid #f0ede8',overflow:'hidden',marginBottom:28,boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ height:4,background:'linear-gradient(90deg,#15803d,#059669)' }} />
          <div style={{ padding:'28px 32px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
              <p style={{ fontFamily:'Fraunces,serif',fontSize:20,fontWeight:900,color:'#1c1917',letterSpacing:'-0.01em' }}>✏️ Write New Article</p>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormErrors({}) }}
                style={{ background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#a8a29e',padding:4 }}
                onMouseEnter={e=>e.currentTarget.style.color='#1c1917'} onMouseLeave={e=>e.currentTarget.style.color='#a8a29e'}>✕</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Title + Author */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
                <div>
                  <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>Article Title <span style={{ color:'#ef4444' }}>*</span></label>
                  <input type="text" name="title" value={form.title} onChange={handleFormChange}
                    placeholder="e.g. Why Cleanliness Matters in Urban Areas" disabled={submitting}
                    className={`aa-input no-icon ${formErrors.title ? 'error' : ''}`} />
                  {formErrors.title && <p style={{ color:'#ef4444',fontSize:12,fontWeight:700,marginTop:5 }}>{formErrors.title}</p>}
                </div>
                <div>
                  <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>Author Name <span style={{ color:'#ef4444' }}>*</span></label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>✍️</span>
                    <input type="text" name="author" value={form.author} onChange={handleFormChange}
                      placeholder="e.g. Dr. Priya Sharma" disabled={submitting}
                      className={`aa-input ${formErrors.author ? 'error' : ''}`} />
                  </div>
                  {formErrors.author && <p style={{ color:'#ef4444',fontSize:12,fontWeight:700,marginTop:5 }}>{formErrors.author}</p>}
                </div>
              </div>

              {/* Cover Image */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block',fontSize:13,fontWeight:800,color:'#1c1917',marginBottom:7 }}>
                  Cover Image URL <span style={{ fontSize:11,color:'#a8a29e',fontWeight:500 }}>(optional)</span>
                </label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>🖼️</span>
                  <input type="url" name="coverImage" value={form.coverImage} onChange={handleFormChange}
                    placeholder="https://example.com/image.jpg" disabled={submitting}
                    className="aa-input" />
                </div>
                {form.coverImage && !imgPreviewError && (
                  <div style={{ marginTop:12,position:'relative',borderRadius:14,overflow:'hidden',height:110,background:'#f5f5f4' }}>
                    <img src={form.coverImage} alt="Cover preview" onError={() => setImgPreviewError(true)} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                    <div style={{ position:'absolute',top:10,right:10,background:'#15803d',color:'#fff',fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:100 }}>✓ Preview</div>
                  </div>
                )}
                {form.coverImage && imgPreviewError && (
                  <p style={{ color:'#d97706',fontSize:12,fontWeight:700,marginTop:8,display:'flex',alignItems:'center',gap:5 }}>⚠️ Could not load image preview — check the URL</p>
                )}
              </div>

              {/* Content */}
              <div style={{ marginBottom:24 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7 }}>
                  <label style={{ fontSize:13,fontWeight:800,color:'#1c1917' }}>Article Content <span style={{ color:'#ef4444' }}>*</span></label>
                  {wordCount > 0 && (
                    <span style={{ fontSize:11,color:'#a8a29e',fontWeight:700 }}>{wordCount} words · ~{readTime} min read</span>
                  )}
                </div>
                <textarea name="content" value={form.content} onChange={handleFormChange}
                  placeholder="Write your article content here. Use new lines to separate paragraphs. Minimum 50 characters..."
                  rows={12} disabled={submitting}
                  className={`aa-textarea ${formErrors.content ? 'error' : ''}`} />
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6 }}>
                  {formErrors.content
                    ? <p style={{ color:'#ef4444',fontSize:12,fontWeight:700 }}>{formErrors.content}</p>
                    : <p style={{ fontSize:12,color:'#a8a29e',fontWeight:500 }}>Use blank lines between paragraphs for better formatting</p>
                  }
                  <span style={{ fontSize:11,color:'#d6d3d1',fontWeight:700,flexShrink:0,marginLeft:8 }}>{form.content.length} chars</span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display:'flex',gap:10 }}>
                <button type="submit" disabled={submitting} style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#15803d',color:'#fff',border:'none',borderRadius:100,padding:'13px',fontSize:14,fontWeight:800,cursor:submitting?'not-allowed':'pointer',fontFamily:'inherit',transition:'all 0.2s',opacity:submitting?0.7:1,boxShadow:'0 4px 14px rgba(21,128,61,0.3)' }}>
                  {submitting ? <><Spinner />Publishing...</> : <>📰 Publish Article</>}
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
      <div style={{ display:'flex',flexWrap:'wrap',gap:10,marginBottom:20 }}>
        <div style={{ position:'relative',flex:1,minWidth:200 }}>
          <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or author..." className="aa-search" />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#a8a29e',fontWeight:800 }}>✕</button>
          )}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="aa-select">
          <option value="newest">🕐 Newest First</option>
          <option value="oldest">🕐 Oldest First</option>
          <option value="title">🔤 Title A → Z</option>
          <option value="author">✍️ By Author</option>
        </select>
      </div>

      {/* ── ARTICLES LIST ── */}
      {loading ? (
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background:'#fff',borderRadius:22,border:'1.5px solid #f0ede8',padding:20,display:'flex',gap:14 }}>
              <div className="aa-skeleton" style={{ width:100,height:100,flexShrink:0 }} />
              <div style={{ flex:1,display:'flex',flexDirection:'column',gap:10 }}>
                <div className="aa-skeleton" style={{ height:14,width:'60%' }} />
                <div className="aa-skeleton" style={{ height:11,width:'30%' }} />
                <div className="aa-skeleton" style={{ height:11,width:'80%' }} />
                <div className="aa-skeleton" style={{ height:11,width:'65%' }} />
              </div>
            </div>
          ))}
        </div>

      ) : filtered.length === 0 ? (
        <div style={{ background:'#fff',borderRadius:24,border:'1.5px solid #f0ede8',textAlign:'center',padding:'72px 32px' }}>
          <div style={{ fontSize:56,marginBottom:14 }}>{search ? '🔍' : '📭'}</div>
          <h3 style={{ fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:'#1c1917',marginBottom:8,letterSpacing:'-0.01em' }}>
            {search ? 'No articles found' : 'No articles yet'}
          </h3>
          <p style={{ fontSize:14,color:'#78716c',marginBottom:24,lineHeight:1.6 }}>
            {search ? `No results for "${search}"` : 'Publish your first awareness article to get started.'}
          </p>
          {!search
            ? <button onClick={openForm} style={{ background:'#15803d',color:'#fff',border:'none',borderRadius:100,padding:'12px 28px',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 14px rgba(21,128,61,0.25)',fontFamily:'inherit' }}>✏️ Write First Article</button>
            : <button onClick={() => setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#15803d',fontSize:14,fontWeight:800,fontFamily:'inherit',textDecoration:'underline' }}>Clear Search</button>
          }
        </div>

      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {filtered.map(article => {
            const publishedDate = article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
              : null
            const wc = article.content?.split(/\s+/).length || 0
            const rt = Math.max(1, Math.ceil(wc / 200))

            return (
              <div key={article.id} className="aa-card">
                <div style={{ display:'flex' }}>
                  {/* Cover */}
                  <div style={{ width:110,flexShrink:0,background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',overflow:'hidden',minHeight:100 }}>
                    {article.coverImage
                      ? <img src={article.coverImage} alt={article.title} onError={e=>e.target.style.display='none'} style={{ width:'100%',height:'100%',objectFit:'cover',minHeight:100 }} />
                      : <div style={{ width:'100%',minHeight:100,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,opacity:0.35 }}>📰</div>
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex:1,padding:'16px 20px',display:'flex',flexDirection:'column',justifyContent:'space-between',minWidth:0 }}>
                    <div>
                      <h3 style={{ fontFamily:'Fraunces,serif',fontWeight:900,fontSize:16,color:'#1c1917',letterSpacing:'-0.01em',lineHeight:1.25,marginBottom:8,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize:13,color:'#78716c',lineHeight:1.6,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',marginBottom:12 }}>
                        {article.content}
                      </p>
                    </div>

                    <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:10 }}>
                      {/* Meta */}
                      <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',gap:12 }}>
                        {article.author && (
                          <span style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:12,color:'#78716c',fontWeight:700 }}>
                            <span style={{ width:22,height:22,background:'linear-gradient(135deg,#15803d,#059669)',borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:10,fontWeight:900,fontFamily:'Fraunces,serif',flexShrink:0 }}>
                              {article.author[0]?.toUpperCase()}
                            </span>
                            {article.author}
                          </span>
                        )}
                        {publishedDate && <span style={{ fontSize:12,color:'#a8a29e',fontWeight:600 }}>📅 {publishedDate}</span>}
                        <span style={{ fontSize:12,color:'#a8a29e',fontWeight:600 }}>⏱️ {rt} min read</span>
                      </div>

                      {/* Delete */}
                      <button onClick={() => setDeleteId(article.id)} style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#fff5f5',border:'1.5px solid #fca5a5',color:'#ef4444',padding:'7px 14px',borderRadius:100,fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}
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
            <h3 style={{ fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,letterSpacing:'-0.01em',color:'#1c1917',marginBottom:10 }}>Delete Article?</h3>
            <p style={{ fontSize:14,color:'#78716c',lineHeight:1.7,marginBottom:28 }}>
              This action cannot be undone. The article will be permanently removed.
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