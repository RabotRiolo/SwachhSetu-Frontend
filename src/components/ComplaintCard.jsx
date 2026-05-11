import { Link } from 'react-router-dom'
import StatusBadge from './StatusBridge'

function hasAiPlan(c) {
  if (!c) return false
  const steps = c.aiSteps
  if (steps == null) return false
  if (typeof steps === 'string') return steps.trim().length > 0
  if (Array.isArray(steps)) return steps.length > 0
  if (typeof steps === 'object') return Object.keys(steps).length > 0
  return true
}

const STATUS_ACCENT = {
  PENDING:     { bg: '#fff8ed', border: '#fed7aa', dot: '#f97316' },
  ASSIGNED:    { bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6' },
  IN_PROGRESS: { bg: '#fff7ed', border: '#fed7aa', dot: '#ea580c' },
  RESOLVED:    { bg: '#f0fdf4', border: '#bbf7d0', dot: '#16a34a' },
}

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null

  const formattedDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null

  const accent = STATUS_ACCENT[complaint.status] || STATUS_ACCENT.PENDING
  const aiPlan = hasAiPlan(complaint)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        @keyframes cc-fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .cc-card {
          display: block;
          text-decoration: none;
          color: inherit;
          background: #fff;
          border-radius: 20px;
          border: 1.5px solid #f0ede8;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          animation: cc-fadein 0.4s ease both;
          font-family: 'Nunito', sans-serif;
          position: relative;
        }
        .cc-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10);
          border-color: #d1fae5;
        }
        .cc-card:hover .cc-thumb img {
          transform: scale(1.06);
        }
        .cc-card:hover .cc-arrow {
          transform: translateX(4px);
        }

        .cc-thumb {
          position: relative;
          width: 100%;
          height: 148px;
          overflow: hidden;
          background: #f5f5f4;
        }
        .cc-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }
        .cc-thumb-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #fafaf8 0%, #f0ede8 100%);
        }

        .cc-body {
          padding: 16px 18px 18px;
        }

        .cc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }

        .cc-area {
          font-family: 'Fraunces', serif;
          font-size: 17px;
          font-weight: 900;
          color: #1c1917;
          letter-spacing: -0.02em;
          line-height: 1.2;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cc-divider {
          height: 1.5px;
          background: #f5f0eb;
          margin: 12px 0;
          border-radius: 100px;
        }

        .cc-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cc-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #a8a29e;
        }

        .cc-meta-icon {
          width: 22px; height: 22px;
          border-radius: 7px;
          background: #f5f0eb;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          flex-shrink: 0;
        }

        .cc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
        }

        .cc-ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f5f3ff;
          border: 1.5px solid #ddd6fe;
          color: #7c3aed;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 100px;
          letter-spacing: 0.04em;
        }

        .cc-ai-dot {
          width: 6px; height: 6px;
          background: #a78bfa;
          border-radius: 50%;
          animation: cc-pulse 1.8s ease-in-out infinite;
        }

        @keyframes cc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        .cc-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          color: #15803d;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 13px;
          border-radius: 100px;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
        }
        .cc-card:hover .cc-view-btn {
          background: #15803d;
          color: #fff;
          border-color: #15803d;
        }

        .cc-arrow {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        .cc-number-strip {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 100px;
          letter-spacing: 0.05em;
          font-family: 'Nunito', sans-serif;
        }
      `}</style>

      <Link to={`/complaints/${complaint.id}`} className="cc-card">

        {/* Thumbnail */}
        <div className="cc-thumb">
          {complaint.imageUrl ? (
            <img
              src={`http://localhost:8084${complaint.imageUrl}`}
              alt={complaint.area}
            />
          ) : (
            <div className="cc-thumb-placeholder">
              <span style={{ fontSize: 40, opacity: 0.2 }}>🏙️</span>
            </div>
          )}

          {/* ID chip on image */}
          {complaint.id && (
            <div className="cc-number-strip">#{String(complaint.id).padStart(4,'0')}</div>
          )}
        </div>

        {/* Body */}
        <div className="cc-body">

          <div className="cc-top">
            <span className="cc-area">{complaint.area}</span>
            <StatusBadge status={complaint.status} />
          </div>

          <div className="cc-divider" />

          <div className="cc-meta">
            {formattedDate && (
              <div className="cc-meta-row">
                <div className="cc-meta-icon">📅</div>
                <span>{formattedDate}</span>
              </div>
            )}
            {complaint.teamName && (
              <div className="cc-meta-row" style={{ color: '#3b82f6' }}>
                <div className="cc-meta-icon" style={{ background: '#eff6ff' }}>👥</div>
                <span>{complaint.teamName}</span>
              </div>
            )}
          </div>

          <div className="cc-footer">
            {aiPlan ? (
              <div className="cc-ai-badge">
                <span className="cc-ai-dot" />
                AI Plan Ready
              </div>
            ) : (
              <span />
            )}
            <div className="cc-view-btn">
              View <span className="cc-arrow">→</span>
            </div>
          </div>

        </div>
      </Link>
    </>
  )
}