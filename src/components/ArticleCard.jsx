import { Link } from 'react-router-dom'
import resolveAssetUrl from '../utils/resolveAssetUrl'

export default function ArticleCard({ article }) {
  if (!article) return null

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
    : null

  const contentStr = typeof article.content === 'string' ? article.content : ''
  const wordCount = contentStr.trim() ? contentStr.trim().split(/\s+/).filter(Boolean).length : 0
  const readTime  = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : null
  const coverSrc = resolveAssetUrl(article.coverImage)

  return (
    <>
      <style>{`
        .ac-card {
          display: block; text-decoration: none; color: inherit;
          background: #fff; border-radius: 24px; border: 1.5px solid #f0ede8;
          overflow: hidden; transition: all 0.25s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .ac-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          border-color: #bbf7d0;
        }
        .ac-card:hover .ac-img { transform: scale(1.06); }
        .ac-card:hover .ac-title { color: #15803d; }
        .ac-card:hover .ac-arrow { transform: translateX(4px); }

        .ac-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .ac-title {
          font-family: 'Fraunces', serif; font-weight: 900;
          font-size: 16px; letter-spacing: -0.01em; line-height: 1.3;
          color: #1c1917; margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          transition: color 0.2s;
        }
        .ac-arrow {
          font-size: 13px; font-weight: 800; color: #15803d;
          transition: transform 0.2s; display: inline-block; flex-shrink: 0; margin-left: 8px;
        }
      `}</style>

      <Link to={`/articles/${article.id}`} className="ac-card">

        {/* Cover image */}
        <div style={{ position:'relative', height:176, background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', overflow:'hidden' }}>
          {coverSrc ? (
            <img src={coverSrc} alt={article.title} className="ac-img" />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', opacity:0.25 }}>
              <span style={{ fontSize:72 }}>📰</span>
            </div>
          )}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />

          {/* Read time badge */}
          {readTime && (
            <div style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', color:'#fff', fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:100 }}>
              ⏱️ {readTime} min
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding:'18px 20px 20px' }}>
          <h3 className="ac-title">{article.title}</h3>

          {article.content && (
            <p style={{ fontSize:13, color:'#78716c', lineHeight:1.65, marginBottom:16, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
              {article.content}
            </p>
          )}

          {/* Footer */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:'1.5px solid #f5f5f4' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
              {article.author && (
                <>
                  <div style={{ width:26, height:26, background:'linear-gradient(135deg,#15803d,#059669)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Fraunces,serif', fontWeight:900, fontSize:11, flexShrink:0 }}>
                    {article.author[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:800, color:'#1c1917', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{article.author}</p>
                    {publishedDate && <p style={{ fontSize:11, color:'#a8a29e', fontWeight:600 }}>{publishedDate}</p>}
                  </div>
                </>
              )}
            </div>
            <span className="ac-arrow">Read →</span>
          </div>
        </div>
      </Link>
    </>
  )
}