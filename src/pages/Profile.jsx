import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import complaintService from '../services/ComplaintService'
import StatusBadge from '../components/StatusBridge'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  useEffect(() => {
    complaintService.getMine()
      .then(r => setComplaints(r.data?.data || []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'PENDING').length,
    assigned: complaints.filter(c => c.status === 'ASSIGNED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
  }

  const resolutionRate =
    stats.total > 0
      ? Math.round((stats.resolved / stats.total) * 100)
      : 0

  const recent = complaints.slice(0, 5)

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const firstLetter = user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <div
      style={{
        fontFamily: "'Nunito','DM Sans',sans-serif",
        background: '#fffdf7',
        minHeight: '100vh',
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px) }
          to   { opacity:1; transform:translateY(0) }
        }

        @keyframes shimmer {
          0% { background-position:-400px 0 }
          100% { background-position:400px 0 }
        }

        .pf-fade {
          animation: fadeUp .5s ease both;
        }

        .pf-d1 { animation-delay: .05s }
        .pf-d2 { animation-delay: .1s }
        .pf-d3 { animation-delay: .15s }
        .pf-d4 { animation-delay: .2s }

        .pf-skeleton {
          background: linear-gradient(
            90deg,
            #f5f5f4 25%,
            #ede9e6 50%,
            #f5f5f4 75%
          );
          background-size:400px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius:10px;
        }

        .pf-card {
          background:#fff;
          border-radius:28px;
          border:1.5px solid #f0ede8;
          box-shadow:0 2px 8px rgba(0,0,0,0.03);
        }

        .pf-stat-card {
          background:#fff;
          border:1.5px solid #f0ede8;
          border-radius:20px;
          padding:18px 10px;
          text-align:center;
          transition:all .25s ease;
        }

        .pf-stat-card:hover {
          border-color:#bbf7d0;
          transform:translateY(-3px);
          box-shadow:0 10px 24px rgba(0,0,0,0.06);
        }

        .pf-row {
          display:flex;
          align-items:center;
          gap:14px;
          padding:14px 22px;
          text-decoration:none;
          color:inherit;
          border-bottom:1.5px solid #f5f5f4;
          transition:background .15s;
        }

        .pf-row:last-child {
          border-bottom:none;
        }

        .pf-row:hover {
          background:#fafaf8;
        }

        .pf-quick {
          display:flex;
          align-items:center;
          gap:14px;
          padding:18px;
          text-decoration:none;
          color:inherit;
          border-radius:20px;
          border:1.5px solid #f0ede8;
          background:#fff;
          transition:all .25s ease;
        }

        .pf-quick:hover {
          border-color:#bbf7d0;
          background:#fafff8;
          box-shadow:0 8px 24px rgba(0,0,0,0.06);
          transform:translateY(-3px);
        }

        .pf-btn-main {
          display:inline-flex;
          align-items:center;
          gap:7px;
          background:#15803d;
          color:#fff;
          padding:11px 20px;
          border-radius:100px;
          font-size:13px;
          font-weight:800;
          text-decoration:none;
          box-shadow:0 4px 14px rgba(21,128,61,0.25);
          transition:all .2s;
          border:none;
          cursor:pointer;
        }

        .pf-btn-main:hover {
          background:#166534;
          transform:translateY(-1px);
          box-shadow:0 8px 20px rgba(21,128,61,0.35);
        }

        .pf-btn-home {
          display:inline-flex;
          align-items:center;
          gap:7px;
          background:#ffffff;
          color:#15803d;
          padding:11px 18px;
          border-radius:100px;
          font-size:13px;
          font-weight:800;
          text-decoration:none;
          border:1.5px solid #bbf7d0;
          transition:all .2s;
        }

        .pf-btn-home:hover {
          background:#f0fdf4;
          transform:translateY(-1px);
        }

        .pf-btn-admin {
          display:inline-flex;
          align-items:center;
          gap:7px;
          background:#7c3aed;
          color:#fff;
          padding:11px 18px;
          border-radius:100px;
          font-size:13px;
          font-weight:800;
          text-decoration:none;
          box-shadow:0 4px 14px rgba(124,58,237,0.28);
          transition:all .2s;
        }

        .pf-btn-admin:hover {
          background:#6d28d9;
          transform:translateY(-1px);
        }

        .pf-btn-ghost {
          display:inline-flex;
          align-items:center;
          gap:7px;
          background:#fff;
          color:#ef4444;
          padding:11px 18px;
          border-radius:100px;
          font-size:13px;
          font-weight:800;
          border:1.5px solid #fca5a5;
          transition:all .2s;
          cursor:pointer;
        }

        .pf-btn-ghost:hover {
          background:#fff5f5;
        }

        @media(max-width:768px) {
          .pf-stats-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .pf-quick-grid {
            grid-template-columns: 1fr !important;
          }

          .pf-top-actions {
            flex-wrap:wrap;
            justify-content:flex-end;
          }
        }
      `}</style>

      {/* HERO */}
      <div
        style={{
          background: '#1c1917',
          height: 170,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            background:
              'radial-gradient(circle,rgba(21,128,61,0.35),transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -40,
            width: 220,
            height: 220,
            background:
              'radial-gradient(circle,rgba(217,119,6,0.18),transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '0 20px 60px',
        }}
      >
        {/* AVATAR + BUTTONS */}
        <div
          style={{
            position: 'relative',
            marginTop: -56,
            marginBottom: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* AVATAR */}
          <div
            style={{
              width: 115,
              height: 115,
              background: 'linear-gradient(135deg,#15803d,#059669)',
              borderRadius: 30,
              border: '4px solid #fffdf7',
              boxShadow: '0 10px 30px rgba(21,128,61,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'Fraunces,serif',
                fontSize: 46,
                fontWeight: 900,
                color: '#fff',
              }}
            >
              {firstLetter}
            </span>
          </div>

          {/* BUTTONS */}
          <div
            className="pf-top-actions"
            style={{
              display: 'flex',
              gap: 10,
              paddingBottom: 6,
            }}
          >
            <Link to="/" className="pf-btn-home">
              🏠 Home
            </Link>

            <Link to="/complaints/new" className="pf-btn-main">
              📸 Report Issue
            </Link>

            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="pf-btn-admin">
                ⚙️ Admin Panel
              </Link>
            )}

            <button
              onClick={() => setLogoutConfirm(true)}
              className="pf-btn-ghost"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* USER INFO */}
        <div
          className="pf-card pf-fade pf-d1"
          style={{
            padding: '24px 28px',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 18,
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 7,
                }}
              >
                <h1
                  style={{
                    fontFamily: 'Fraunces,serif',
                    fontSize: 28,
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: '#1c1917',
                    lineHeight: 1.1,
                  }}
                >
                  {user?.name}
                </h1>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '5px 12px',
                    borderRadius: 100,
                    background:
                      user?.role === 'ADMIN'
                        ? '#f5f3ff'
                        : '#f0fdf4',
                    color:
                      user?.role === 'ADMIN'
                        ? '#7c3aed'
                        : '#15803d',
                    border: `1px solid ${
                      user?.role === 'ADMIN'
                        ? '#e9d5ff'
                        : '#bbf7d0'
                    }`,
                  }}
                >
                  {user?.role === 'ADMIN'
                    ? '⚙️ Admin'
                    : '🌿 Citizen'}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: '#78716c',
                  fontWeight: 700,
                  marginBottom: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                📧 {user?.email}
              </p>

              {joinedDate && (
                <p
                  style={{
                    fontSize: 12,
                    color: '#a8a29e',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  📅 Member since {joinedDate}
                </p>
              )}
            </div>

            {stats.total > 0 && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: 22,
                  padding: '16px 24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Fraunces,serif',
                    fontSize: 38,
                    fontWeight: 900,
                    color: '#15803d',
                    lineHeight: 1,
                  }}
                >
                  {resolutionRate}%
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: '#15803d',
                    fontWeight: 800,
                    marginTop: 4,
                  }}
                >
                  Resolution Rate
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
        <div
          className="pf-stats-grid pf-fade pf-d2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[
            {
              label: 'Total',
              value: stats.total,
              icon: '📋',
              color: '#57534e',
            },
            {
              label: 'Pending',
              value: stats.pending,
              icon: '⏳',
              color: '#d97706',
            },
            {
              label: 'Assigned',
              value: stats.assigned,
              icon: '👥',
              color: '#2563eb',
            },
            {
              label: 'Progress',
              value: stats.inProgress,
              icon: '🔧',
              color: '#ea580c',
            },
            {
              label: 'Resolved',
              value: stats.resolved,
              icon: '✅',
              color: '#15803d',
            },
          ].map(s => (
            <div key={s.label} className="pf-stat-card">
              <div style={{ fontSize: 18, marginBottom: 5 }}>
                {s.icon}
              </div>

              <div
                style={{
                  fontFamily: 'Fraunces,serif',
                  fontSize: 26,
                  fontWeight: 900,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: '#a8a29e',
                  fontWeight: 800,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* RECENT */}
        <div
          className="pf-card pf-fade pf-d3"
          style={{
            overflow: 'hidden',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 22px',
              borderBottom: '1.5px solid #f5f5f4',
            }}
          >
            <p
              style={{
                fontFamily: 'Fraunces,serif',
                fontSize: 17,
                fontWeight: 900,
                color: '#1c1917',
              }}
            >
              Recent Complaints
            </p>

            <Link
              to="/dashboard"
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#15803d',
                textDecoration: 'none',
              }}
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 20 }}>
              Loading...
            </div>
          ) : recent.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '55px 24px',
              }}
            >
              <div
                style={{
                  fontSize: 50,
                  marginBottom: 14,
                }}
              >
                📝
              </div>

              <p
                style={{
                  fontFamily: 'Fraunces,serif',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#1c1917',
                  marginBottom: 8,
                }}
              >
                No complaints yet
              </p>

              <p
                style={{
                  fontSize: 13,
                  color: '#78716c',
                  marginBottom: 22,
                }}
              >
                Start by reporting a cleanliness issue nearby.
              </p>

              <Link
                to="/complaints/new"
                className="pf-btn-main"
              >
                📸 Raise Complaint
              </Link>
            </div>
          ) : (
            <div>
              {recent.map(c => (
                <Link
                  key={c.id}
                  to={`/complaints/${c.id}`}
                  className="pf-row"
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      background: '#f0fdf4',
                      border: '1.5px solid #dcfce7',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {c.imageUrl ? (
                      <img
                        src={`http://localhost:8084${c.imageUrl}`}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 18 }}>
                        🏙️
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: '#1c1917',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: 4,
                      }}
                    >
                      {c.area}
                    </p>

                    <p
                      style={{
                        fontSize: 11,
                        color: '#a8a29e',
                        fontWeight: 700,
                      }}
                    >
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : ''}
                    </p>
                  </div>

                  <StatusBadge status={c.status} />

                  <span
                    style={{
                      color: '#d6d3d1',
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div
          className="pf-card pf-fade pf-d4"
          style={{
            padding: '22px 24px',
          }}
        >
          <p
            style={{
              fontFamily: 'Fraunces,serif',
              fontSize: 17,
              fontWeight: 900,
              color: '#1c1917',
              marginBottom: 18,
            }}
          >
            Quick Actions
          </p>

          <div
            className="pf-quick-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {[
              {
                to: '/',
                icon: '🏠',
                title: 'Home',
                desc: 'Go back to homepage',
              },
              {
                to: '/complaints/new',
                icon: '📸',
                title: 'Raise Complaint',
                desc: 'Report a dirty area',
              },
              {
                to: '/dashboard',
                icon: '📊',
                title: 'Dashboard',
                desc: 'Track your complaints',
              },
              {
                to: '/events',
                icon: '🗓️',
                title: 'Events',
                desc: 'Join cleanliness drives',
              },
            ].map(a => (
              <Link
                key={a.to}
                to={a.to}
                className="pf-quick"
              >
                <span
                  style={{
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {a.icon}
                </span>

                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'Fraunces,serif',
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#1c1917',
                      marginBottom: 2,
                    }}
                  >
                    {a.title}
                  </p>

                  <p
                    style={{
                      fontSize: 11,
                      color: '#a8a29e',
                      fontWeight: 700,
                    }}
                  >
                    {a.desc}
                  </p>
                </div>

                <span
                  style={{
                    color: '#d6d3d1',
                    fontSize: 15,
                    marginLeft: 'auto',
                  }}
                >
                  →
                </span>
              </Link>
            ))}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="pf-quick"
                style={{
                  gridColumn: '1 / -1',
                  background: '#faf5ff',
                  borderColor: '#e9d5ff',
                }}
              >
                <span style={{ fontSize: 24 }}>
                  ⚙️
                </span>

                <div>
                  <p
                    style={{
                      fontFamily: 'Fraunces,serif',
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#6d28d9',
                      marginBottom: 2,
                    }}
                  >
                    Admin Panel
                  </p>

                  <p
                    style={{
                      fontSize: 11,
                      color: '#8b5cf6',
                      fontWeight: 700,
                    }}
                  >
                    Manage complaints, teams & articles
                  </p>
                </div>

                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 100,
                    background: '#e9d5ff',
                    color: '#6d28d9',
                  }}
                >
                  ADMIN
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {logoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28,25,23,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 30,
              padding: '40px 36px',
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
              border: '1.5px solid #f0ede8',
            }}
          >
            <div
              style={{
                fontSize: 54,
                marginBottom: 16,
              }}
            >
              🚪
            </div>

            <h3
              style={{
                fontFamily: 'Fraunces,serif',
                fontSize: 24,
                fontWeight: 900,
                color: '#1c1917',
                marginBottom: 10,
              }}
            >
              Logout?
            </h3>

            <p
              style={{
                fontSize: 14,
                color: '#78716c',
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Are you sure you want to logout from
              SwachhSetu?
            </p>

            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                onClick={() => setLogoutConfirm(false)}
                style={{
                  flex: 1,
                  background: '#f5f5f4',
                  border: '1.5px solid #e7e5e4',
                  borderRadius: 100,
                  padding: 13,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#57534e',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 100,
                  padding: 13,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}