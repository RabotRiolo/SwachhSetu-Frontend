import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import articleService from '../services/ArticleService'
import resolveAssetUrl from '../utils/resolveAssetUrl'

export default function ArticleDetail() {
  const { id } = useParams()

  const [article, setArticle]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [imgError, setImgError] = useState(false)
  const [copied, setCopied]     = useState(false)
  const [related, setRelated]   = useState([])

  useEffect(() => {
    setLoading(true)
    setError(false)
    setImgError(false)

    articleService.getById(id)
      .then(r => {
        setArticle(r.data?.data)
        return articleService.getAll()
      })
      .then(r => {
        const all = r.data?.data || []
        setRelated(all.filter(a => String(a.id) !== String(id)).slice(0, 3))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* silent */ }
  }

  const readTime = article?.content
    ? Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))
    : null

  // ── Shared styles (mirror Home.jsx tokens) ──────────────
  const S = {
    page:    { fontFamily: "'Nunito', 'DM Sans', sans-serif", background: '#fffdf7', color: '#1c1917', lineHeight: 1.6, minHeight: '100vh', padding: '40px 5% 80px' },
    fraunces:{ fontFamily: "'Fraunces', serif" },
    muted:   { color: '#78716c' },
    hint:    { color: '#a8a29e' },
    card:    { background: '#fff', borderRadius: 24, border: '1.5px solid #f3f4f6', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
    tag:     { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#15803d', padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', border: '1.5px solid #bbf7d0' },
  }

  // ── LOADING SKELETON ─────────────────────────────────────
  if (loading) {
    return (
      <div style={S.page}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
          @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
          .sk { background:#e7e5e4; border-radius:8px; animation: shimmer 1.4s ease-in-out infinite; }
        `}</style>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="sk" style={{ height: 14, width: 120, marginBottom: 32 }} />
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div className="sk" style={{ height: 300, borderRadius: 0 }} />
            <div style={{ padding: '40px 40px 32px' }}>
              <div className="sk" style={{ height: 28, width: '70%', marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                <div className="sk" style={{ height: 12, width: 100 }} />
                <div className="sk" style={{ height: 12, width: 80 }} />
              </div>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="sk" style={{ height: 14, width: i === 3 ? '80%' : '100%', marginBottom: 10 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── ERROR / NOT FOUND ────────────────────────────────────
  if (error || !article) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');`}</style>
        <div style={{ ...S.card, padding: '56px 48px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📭</div>
          <h2 style={{ ...S.fraunces, fontSize: 28, fontWeight: 900, marginBottom: 10, letterSpacing: '-0.02em' }}>Article Not Found</h2>
          <p style={{ ...S.muted, fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
            This article may have been removed or the link is incorrect.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              to="/articles"
              style={{ background: '#15803d', color: '#fff', padding: '14px 32px', borderRadius: 100, fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(21,128,61,0.2)', transition: 'all 0.2s' }}
            >
              ← Back to Articles
            </Link>
            <Link to="/" style={{ color: '#a8a29e', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── FORMATTED VALUES ─────────────────────────────────────
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const paragraphs =
    typeof article.content === 'string' && article.content.trim()
      ? article.content.split('\n').map(p => p.trim()).filter(Boolean)
      : []

  const coverSrc = resolveAssetUrl(article.coverImage)

  // ── MAIN RENDER ──────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fraunces { font-family: 'Fraunces', serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.3); opacity: 0; } }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .d1{animation-delay:0.05s} .d2{animation-delay:0.15s} .d3{animation-delay:0.25s} .d4{animation-delay:0.35s}
        .btn-main { background: #15803d; color: #fff; padding: 13px 28px; border-radius: 100px; font-size: 14px; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.25s; box-shadow: 0 6px 20px rgba(21,128,61,0.22); font-family: inherit; cursor: pointer; border: none; }
        .btn-main:hover { background: #166534; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(21,128,61,0.3); }
        .btn-secondary { background: #fff; color: #15803d; padding: 13px 28px; border-radius: 100px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; border: 2px solid #bbf7d0; transition: all 0.25s; font-family: inherit; cursor: pointer; }
        .btn-secondary:hover { border-color: #15803d; background: #f0fdf4; transform: translateY(-2px); }
        .article-card { background: #fff; border-radius: 24px; border: 1.5px solid #f3f4f6; box-shadow: 0 4px 32px rgba(0,0,0,0.07); overflow: hidden; }
        .related-link { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 16px; text-decoration: none; transition: all 0.2s; }
        .related-link:hover { background: #f5f5f4; }
        .related-link:hover .rel-title { color: #15803d; }
        .related-link:hover .rel-arrow { color: #15803d; }
        .quick-link { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 16px; text-decoration: none; border: 1.5px solid; transition: all 0.2s; }
        .quick-link:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
        .back-link { display: inline-flex; align-items: center; gap: 6px; color: #15803d; text-decoration: none; font-size: 14px; font-weight: 700; margin-bottom: 28px; transition: all 0.2s; }
        .back-link:hover { color: #166534; gap: 8px; }
        .share-btn { position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.18); backdrop-filter: blur(8px); border: 1.5px solid rgba(255,255,255,0.3); color: #fff; padding: 7px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; font-family: inherit; }
        .share-btn:hover { background: rgba(255,255,255,0.28); }
        .tag-pill { background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #15803d; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 100px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #fffdf7; }
        ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Back link */}
        <Link to="/articles" className="back-link fade-up d1">
          <span>←</span> Back to Articles
        </Link>

        {/* ── MAIN ARTICLE CARD ─────────────────────────── */}
        <article className="article-card fade-up d2" style={{ marginBottom: 20 }}>

          {/* Cover image */}
          <div style={{ position: 'relative', height: 320, background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 60%, #fef9c3 100%)', overflow: 'hidden' }}>
            {coverSrc && !imgError ? (
              <img
                src={coverSrc}
                alt={article.title}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.25 }}>
                <span style={{ fontSize: 100 }}>📰</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,25,23,0.72) 0%, rgba(28,25,23,0.15) 50%, transparent 100%)' }} />

            {/* Share button */}
            <button type="button" className="share-btn" onClick={handleShare}>
              {copied ? '✅ Copied!' : '🔗 Share'}
            </button>

            {/* Title overlay */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 32px' }}>
              <h1 className="fraunces" style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {article.title}
              </h1>
            </div>
          </div>

          {/* ── ARTICLE BODY ────────────────────────────── */}
          <div style={{ padding: '32px 36px 36px' }}>

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, paddingBottom: 24, marginBottom: 28, borderBottom: '1.5px solid #f3f4f6' }}>
              {article.author && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontWeight: 900, fontSize: 15, border: '1.5px solid #bbf7d0', flexShrink: 0, fontFamily: 'Fraunces, serif' }}>
                    {article.author[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#a8a29e', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 2 }}>WRITTEN BY</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#1c1917' }}>{article.author}</p>
                  </div>
                </div>
              )}

              {publishedDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, ...S.muted }}>
                  <span>📅</span>
                  <span style={{ fontWeight: 600 }}>{publishedDate}</span>
                </div>
              )}

              {readTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, ...S.hint, marginLeft: 'auto' }}>
                  <span>⏱️</span>
                  <span style={{ fontWeight: 700 }}>{readTime} min read</span>
                </div>
              )}
            </div>

            {/* Article content */}
            <div>
              {paragraphs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {paragraphs.map((para, i) => (
                    <p
                      key={i}
                      style={{
                        fontSize: i === 0 ? 17 : 15,
                        fontWeight: i === 0 ? 600 : 400,
                        color: i === 0 ? '#1c1917' : '#57534e',
                        lineHeight: 1.85,
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p style={{ ...S.muted, fontStyle: 'italic', fontSize: 14 }}>No content available for this article.</p>
              )}
            </div>

            {/* Tags + share footer */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 36, paddingTop: 24, borderTop: '1.5px solid #f3f4f6' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Cleanliness', 'Civic Duty', 'Swachh Bharat'].map(tag => (
                  <span key={tag} className="tag-pill">#{tag.replace(' ', '')}</span>
                ))}
              </div>
              <button
                type="button"
                onClick={handleShare}
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#15803d', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s' }}
              >
                <span>{copied ? '✅' : '🔗'}</span>
                {copied ? 'Copied!' : 'Share Article'}
              </button>
            </div>
          </div>
        </article>

        {/* ── RELATED ARTICLES ─────────────────────────── */}
        {related.length > 0 && (
          <div className="fade-up d3" style={{ ...S.card, padding: '28px 28px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={S.tag}>📚 More Articles</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {related.map(rel => {
                const relCover = resolveAssetUrl(rel.coverImage)
                return (
                <Link key={rel.id} to={`/articles/${rel.id}`} className="related-link">
                  {/* Thumbnail */}
                  <div style={{ width: 52, height: 52, background: '#f0fdf4', borderRadius: 14, flexShrink: 0, overflow: 'hidden', border: '1.5px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {relCover ? (
                      <img src={relCover} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 22 }}>📰</span>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="rel-title" style={{ fontWeight: 800, fontSize: 14, color: '#1c1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s', marginBottom: 3 }}>
                      {rel.title}
                    </p>
                    {rel.author && (
                      <p style={{ fontSize: 12, color: '#a8a29e', fontWeight: 600 }}>by {rel.author}</p>
                    )}
                  </div>
                  <span className="rel-arrow" style={{ color: '#d6d3d1', fontSize: 16, flexShrink: 0, transition: 'color 0.2s' }}>→</span>
                </Link>
                )
              })}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1.5px solid #f5f5f4' }}>
              <Link to="/articles" style={{ color: '#15803d', textDecoration: 'none', fontSize: 14, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                View All Articles →
              </Link>
            </div>
          </div>
        )}

        {/* ── QUICK LINKS ──────────────────────────────── */}
        <div className="fade-up d4" style={{ ...S.card, padding: '24px 28px' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#a8a29e', letterSpacing: '0.08em', marginBottom: 16 }}>ALSO EXPLORE</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { to: '/articles',       icon: '📰', title: 'All Articles',  desc: 'Browse more reads',       bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
              { to: '/events',         icon: '🗓️', title: 'Events',        desc: 'Join cleanliness drives',  bg: '#fef9c3', border: '#fde68a', text: '#854d0e' },
              { to: '/complaints/new', icon: '📸', title: 'Report Issue',  desc: 'Flag dirty areas',         bg: '#fef3c7', border: '#fcd34d', text: '#78350f' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="quick-link"
                style={{ background: link.bg, borderColor: link.border, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}
              >
                <span style={{ fontSize: 22 }}>{link.icon}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 13, color: link.text, marginBottom: 2 }}>{link.title}</p>
                  <p style={{ fontSize: 12, color: '#a8a29e', fontWeight: 600 }}>{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}