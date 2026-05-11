import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import articleService from '../services/ArticleService'
import ArticleCard from '../components/ArticleCard'
import resolveAssetUrl from '../utils/resolveAssetUrl'

const SORT_OPTIONS = [
  { value: 'newest', label: '🕐 Newest First' },
  { value: 'oldest', label: '🕐 Oldest First' },
  { value: 'title',  label: '🔤 Title: A → Z'  },
  { value: 'author', label: '✍️ By Author'      },
]

export default function Articles() {
  const [articles, setArticles]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [sortBy, setSortBy]             = useState('newest')
  const [authorFilter, setAuthorFilter] = useState('ALL')

  useEffect(() => {
    articleService.getAll()
      .then(r => setArticles(r.data?.data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  const authors  = ['ALL', ...new Set(articles.map(a => a.author).filter(Boolean))]
  const filtered = articles
    .filter(a => {
      const matchSearch =
        !search.trim() ||
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.author?.toLowerCase().includes(search.toLowerCase()) ||
        a.content?.toLowerCase().includes(search.toLowerCase())
      const matchAuthor = authorFilter === 'ALL' || a.author === authorFilter
      return matchSearch && matchAuthor
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.publishedAt) - new Date(a.publishedAt)
      if (sortBy === 'oldest') return new Date(a.publishedAt) - new Date(b.publishedAt)
      if (sortBy === 'title')  return a.title?.localeCompare(b.title)
      if (sortBy === 'author') return a.author?.localeCompare(b.author)
      return 0
    })

  const featured  = !loading && articles.length > 0 ? articles[0] : null
  const restItems = filtered.filter(a => a.id !== featured?.id)

  const showFeatured = !loading && featured && !search && authorFilter === 'ALL'
  const featuredCover = featured ? resolveAssetUrl(featured.coverImage) : ''

  return (
    <div style={{ fontFamily:"'Nunito','DM Sans',sans-serif", minHeight:'100vh', background:'#fffdf7', color:'#1c1917' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing:border-box; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring{ 0%{transform:scale(0.9);opacity:0.8} 100%{transform:scale(1.4);opacity:0} }
        @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

        .ar-fade{animation:fadeUp 0.6s ease both}
        .ar-d1{animation-delay:0.05s} .ar-d2{animation-delay:0.15s} .ar-d3{animation-delay:0.25s}

        .ar-search {
          width:100%; border:1.5px solid #e7e5e4; border-radius:14px;
          padding:11px 38px 11px 40px; font-size:14px; font-family:inherit;
          font-weight:600; color:#1c1917; background:#fff; outline:none; transition:all 0.2s;
        }
        .ar-search::placeholder{color:#a8a29e;font-weight:500}
        .ar-search:focus{border-color:#15803d;box-shadow:0 0 0 4px rgba(21,128,61,0.08)}

        .ar-select {
          border:1.5px solid #e7e5e4; border-radius:100px;
          padding:9px 16px; font-size:13px; font-weight:700;
          font-family:inherit; color:#57534e; background:#fff;
          outline:none; cursor:pointer; transition:border-color 0.2s;
        }
        .ar-select:focus{border-color:#15803d}

        .ar-featured-card {
          background:#fff; border-radius:28px; border:1.5px solid #f0ede8;
          overflow:hidden; text-decoration:none; display:flex; flex-direction:column;
          transition:all 0.3s; box-shadow:0 4px 24px rgba(0,0,0,0.04);
        }
        @media(min-width:768px){ .ar-featured-card{flex-direction:row} }
        .ar-featured-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.09)}

        .ar-btn-main {
          display:inline-flex;align-items:center;gap:8px;
          background:#15803d;color:#fff;padding:13px 28px;border-radius:100px;
          font-size:14px;font-weight:800;text-decoration:none;border:none;cursor:pointer;
          box-shadow:0 6px 18px rgba(21,128,61,0.25);transition:all 0.25s;font-family:inherit;
        }
        .ar-btn-main:hover{background:#166534;transform:translateY(-2px);box-shadow:0 10px 28px rgba(21,128,61,0.35)}

        .ar-btn-secondary {
          display:inline-flex;align-items:center;gap:8px;
          background:#fff;color:#15803d;padding:12px 28px;border-radius:100px;
          font-size:14px;font-weight:700;text-decoration:none;
          border:2px solid #bbf7d0;transition:all 0.25s;
        }
        .ar-btn-secondary:hover{border-color:#15803d;background:#f0fdf4;transform:translateY(-2px)}

        .ar-skeleton {
          background:linear-gradient(90deg,#f5f5f4 25%,#ede9e6 50%,#f5f5f4 75%);
          background-size:400px 100%;animation:shimmer 1.4s ease infinite;border-radius:12px;
        }

        .ar-clear-btn{color:#15803d;font-weight:800;font-size:13px;background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
        .ar-clear-btn:hover{color:#166534}
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background:'#1c1917', position:'relative', overflow:'hidden', padding:'72px 5% 80px' }}>
        {/* Dot grid */}
        <div style={{ position:'absolute',inset:0,opacity:0.07,pointerEvents:'none',
          backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',
          backgroundSize:'28px 28px' }} />
        {/* Blobs */}
        <div style={{ position:'absolute',top:-80,right:-80,width:360,height:360,background:'radial-gradient(circle,rgba(21,128,61,0.3) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-60,left:-60,width:300,height:300,background:'radial-gradient(circle,rgba(217,119,6,0.2) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />

        <div style={{ maxWidth:1200,margin:'0 auto',position:'relative' }}>
          <div style={{ display:'flex',flexWrap:'wrap',alignItems:'flex-end',justifyContent:'space-between',gap:32 }}>
            <div>
              {/* Tag */}
              <div className="ar-fade ar-d1" style={{ display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.08)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:100,padding:'6px 14px',marginBottom:20 }}>
                <span style={{ width:8,height:8,background:'#22c55e',borderRadius:'50%',flexShrink:0,position:'relative',display:'inline-block' }}>
                  <span style={{ position:'absolute',inset:-2,background:'#22c55e',borderRadius:'50%',opacity:0.4,animation:'pulse-ring 1.5s ease-out infinite' }} />
                </span>
                <span style={{ fontSize:12,fontWeight:800,color:'rgba(255,255,255,0.7)',letterSpacing:'0.06em' }}>Awareness & Education</span>
              </div>

              <h1 className="ar-fade ar-d2" style={{ fontFamily:'Fraunces,serif',fontSize:'clamp(40px,6vw,72px)',fontWeight:900,letterSpacing:'-0.02em',lineHeight:1.0,color:'#fff',marginBottom:16 }}>
                Cleanliness<br /><span style={{ color:'#4ade80',fontStyle:'italic' }}>Articles</span>
              </h1>
              <p className="ar-fade ar-d3" style={{ fontSize:17,lineHeight:1.8,color:'rgba(255,255,255,0.55)',maxWidth:480,fontWeight:400 }}>
                Learn about hygiene, civic responsibility, and how small actions can make a big difference.
              </p>
            </div>

            {/* Stats */}
            <div className="ar-fade ar-d3" style={{ display:'flex',gap:12,flexShrink:0 }}>
              {[
                { n: articles.length, l:'Articles', icon:'📰' },
                { n: new Set(articles.map(a=>a.author).filter(Boolean)).size, l:'Authors', icon:'✍️' },
              ].map(s => (
                <div key={s.l} style={{ background:'rgba(255,255,255,0.07)',border:'1.5px solid rgba(255,255,255,0.12)',borderRadius:20,padding:'18px 24px',textAlign:'center',backdropFilter:'blur(10px)' }}>
                  <div style={{ fontSize:20,marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontFamily:'Fraunces,serif',fontSize:32,fontWeight:900,color:'#fff',lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:12,color:'rgba(255,255,255,0.45)',fontWeight:700,marginTop:4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth:1200,margin:'0 auto',padding:'48px 5%' }}>

        {/* ── FEATURED ── */}
        {showFeatured && (
          <div style={{ marginBottom:48 }}>
            {/* Section label */}
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
              <span style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#fef9c3',border:'1.5px solid #fde68a',borderRadius:100,padding:'5px 14px' }}>
                <span style={{ width:8,height:8,background:'#d97706',borderRadius:'50%' }} />
                <span style={{ fontFamily:'Fraunces,serif',fontSize:15,fontWeight:900,color:'#92400e' }}>Featured</span>
              </span>
            </div>

            <Link to={`/articles/${featured.id}`} className="ar-featured-card">
              {/* Cover image */}
              <div style={{ width:'100%',minHeight:220,background:'linear-gradient(135deg,#dcfce7,#d1fae5)',flexShrink:0,overflow:'hidden',position:'relative' }}
                className="ar-featured-img">
                <style>{`.ar-featured-img{} @media(min-width:768px){.ar-featured-img{width:40%!important;min-height:unset!important}}`}</style>
                {featuredCover ? (
                  <img src={featuredCover} alt={featured.title}
                    style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                    onMouseLeave={e=>e.currentTarget.style.transform=''} />
                ) : (
                  <div style={{ width:'100%',height:'100%',minHeight:220,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.35 }}>
                    <span style={{ fontSize:80 }}>📰</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ flex:1,padding:'28px 32px',display:'flex',flexDirection:'column',justifyContent:'space-between' }}>
                <div>
                  <span style={{ display:'inline-flex',alignItems:'center',gap:5,background:'#fef9c3',border:'1px solid #fde68a',color:'#92400e',fontSize:11,fontWeight:800,padding:'4px 12px',borderRadius:100,marginBottom:16 }}>
                    ⭐ Latest
                  </span>
                  <h2 style={{ fontFamily:'Fraunces,serif',fontSize:'clamp(20px,3vw,28px)',fontWeight:900,letterSpacing:'-0.02em',color:'#1c1917',marginBottom:12,lineHeight:1.2 }}>
                    {featured.title}
                  </h2>
                  <p style={{ fontSize:14,lineHeight:1.8,color:'#78716c',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                    {featured.content}
                  </p>
                </div>

                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:24,paddingTop:20,borderTop:'1.5px solid #f0ede8' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ width:36,height:36,background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Fraunces,serif',fontWeight:900,fontSize:15,color:'#15803d' }}>
                      {featured.author?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize:13,fontWeight:800,color:'#1c1917' }}>{featured.author}</p>
                      {featured.publishedAt && (
                        <p style={{ fontSize:11,color:'#a8a29e',fontWeight:600 }}>
                          {new Date(featured.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </p>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize:14,fontWeight:800,color:'#15803d',display:'inline-flex',alignItems:'center',gap:4,transition:'gap 0.2s' }}>
                    Read More →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── TOOLBAR ── */}
        <div style={{ display:'flex',flexDirection:'column',gap:14,marginBottom:36 }}>
          <div style={{ display:'flex',flexWrap:'wrap',gap:10 }}>
            {/* Search */}
            <div style={{ position:'relative',flex:1,minWidth:200 }}>
              <span style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>🔍</span>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search articles, authors..." className="ar-search" />
              {search && (
                <button onClick={()=>setSearch('')} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#a8a29e',fontWeight:800 }}>✕</button>
              )}
            </div>

            {/* Author filter */}
            {authors.length > 2 && (
              <select value={authorFilter} onChange={e=>setAuthorFilter(e.target.value)} className="ar-select">
                {authors.map(a => <option key={a} value={a}>{a==='ALL'?'✍️ All Authors':a}</option>)}
              </select>
            )}

            {/* Sort */}
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="ar-select">
              {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Result count */}
          {!loading && (
            <p style={{ fontSize:13,color:'#a8a29e',fontWeight:700 }}>
              {search || authorFilter !== 'ALL' ? (
                <>
                  {filtered.length} result{filtered.length!==1?'s':''}{search&&<> for "<b style={{color:'#78716c'}}>{search}</b>"</>}{authorFilter!=='ALL'&&<> by <b style={{color:'#78716c'}}>{authorFilter}</b></>}
                  {' · '}<button className="ar-clear-btn" onClick={()=>{setSearch('');setAuthorFilter('ALL')}}>Clear filters</button>
                </>
              ) : (
                <>{articles.length} article{articles.length!==1?'s':''} available</>
              )}
            </p>
          )}
        </div>

        {/* ── ARTICLES GRID ── */}
        {loading ? (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'#fff',borderRadius:24,border:'1.5px solid #f0ede8',overflow:'hidden' }}>
                <div className="ar-skeleton" style={{ height:180 }} />
                <div style={{ padding:20,display:'flex',flexDirection:'column',gap:10 }}>
                  <div className="ar-skeleton" style={{ height:16,width:'75%' }} />
                  <div className="ar-skeleton" style={{ height:13,width:'50%' }} />
                  <div className="ar-skeleton" style={{ height:13,width:'65%' }} />
                </div>
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ background:'#fff',borderRadius:28,border:'1.5px solid #f0ede8',textAlign:'center',padding:'80px 32px' }}>
            <div style={{ fontSize:56,marginBottom:16 }}>{search||authorFilter!=='ALL'?'🔍':'📭'}</div>
            <h3 style={{ fontFamily:'Fraunces,serif',fontSize:26,fontWeight:900,color:'#1c1917',marginBottom:10,letterSpacing:'-0.01em' }}>
              {search||authorFilter!=='ALL' ? 'No articles found' : 'No articles yet'}
            </h3>
            <p style={{ fontSize:15,color:'#78716c',marginBottom:28,maxWidth:320,margin:'0 auto 28px' }}>
              {search ? `No results for "${search}"` : authorFilter!=='ALL' ? `No articles by ${authorFilter}` : 'Articles will appear here once published by admins.'}
            </p>
            {(search||authorFilter!=='ALL') && (
              <button className="ar-btn-main" onClick={()=>{setSearch('');setAuthorFilter('ALL')}}>Clear Filters</button>
            )}
          </div>

        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20 }}>
            {(search||authorFilter!=='ALL' ? filtered : restItems).map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* ── CTA BANNER ── */}
        {!loading && articles.length > 0 && (
          <div style={{ marginTop:64,background:'linear-gradient(135deg,#dcfce7 0%,#d1fae5 50%,#fef9c3 100%)',borderRadius:32,padding:'clamp(40px,5vw,64px)',textAlign:'center',position:'relative',overflow:'hidden',border:'2px solid #bbf7d0' }}>
            <div style={{ position:'absolute',top:-40,right:-40,width:200,height:200,background:'rgba(255,255,255,0.4)',borderRadius:'50%',pointerEvents:'none' }} />
            <div style={{ position:'absolute',bottom:-50,left:-30,width:240,height:240,background:'rgba(255,255,255,0.3)',borderRadius:'50%',pointerEvents:'none' }} />
            <div style={{ position:'relative' }}>
              <div style={{ fontSize:48,marginBottom:16 }}>✍️</div>
              <h3 style={{ fontFamily:'Fraunces,serif',fontSize:'clamp(26px,4vw,40px)',fontWeight:900,letterSpacing:'-0.02em',color:'#1c1917',marginBottom:12 }}>
                Want to<br /><span style={{ color:'#15803d',fontStyle:'italic' }}>Contribute?</span>
              </h3>
              <p style={{ fontSize:15,color:'#78716c',maxWidth:380,margin:'0 auto 32px',lineHeight:1.75 }}>
                Have knowledge about cleanliness or civic responsibility? Contact an admin to publish your article.
              </p>
              <div style={{ display:'flex',justifyContent:'center',flexWrap:'wrap',gap:12 }}>
                <Link to="/complaints/new" className="ar-btn-main">📸 Report Dirty Area</Link>
                <Link to="/events" className="ar-btn-secondary">🗓️ View Events</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}