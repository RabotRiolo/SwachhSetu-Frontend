import { useState, useMemo, useEffect } from 'react'
import resolveAssetUrl from '../utils/resolveAssetUrl'

/** Remove wrapping "…"/'…' and escaped quotes from API / JSON lines */
function cleanQuotedString(str) {
  if (typeof str !== 'string') return ''
  let t = str.trim().replace(/\\"/g, '"').replace(/\\'/g, "'")
  let prev
  do {
    prev = t
    if (t.length >= 2 && t[0] === '"' && t[t.length - 1] === '"') {
      t = t.slice(1, -1).trim()
    } else if (t.length >= 2 && t[0] === "'" && t[t.length - 1] === "'") {
      t = t.slice(1, -1).trim()
    }
  } while (t !== prev)
  return t.trim()
}

/** Backend may use camelCase or snake_case */
export function getCleanImageRaw(c) {
  if (!c || typeof c !== 'object') return ''
  const v =
    c.aiCleanImageUrl ??
    c.ai_clean_image_url ??
    c.cleanImageUrl ??
    c.clean_image_url
  if (typeof v === 'string') return v.trim()
  return v != null ? String(v).trim() : ''
}

/** Reject plain-text prompts mistakenly stored as “URL” (avoids broken <img src>). */
function looksLikeImageSource(raw) {
  if (raw == null || typeof raw !== 'string') return false
  const t = raw.trim()
  if (!t) return false
  if (/^https?:\/\//i.test(t)) return true
  if (t.startsWith('//')) return true
  if (t.startsWith('/') || t.startsWith('data:') || t.startsWith('blob:')) return true
  if (/\/uploads\//i.test(t) || /^uploads\//i.test(t)) return true
  if (/\/.+\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(t)) return true
  if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(t)) return true
  if (/placehold\.co|pollinations\.ai|replicate\.delivery|huggingface\.co/i.test(t)) return true
  return false
}

/** Resolved absolute URL for the clean-vision image, or '' if missing / not loadable. */
export function resolveCleanPreviewUrl(complaint) {
  const raw = getCleanImageRaw(complaint)
  if (!looksLikeImageSource(raw)) return ''
  return resolveAssetUrl(raw)
}

function parseAiSteps(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) {
    return raw.map(normalizeStepItem).filter(Boolean)
  }
  if (typeof raw === 'object') {
    if (Array.isArray(raw.steps)) return raw.steps.map(normalizeStepItem).filter(Boolean)
    if (Array.isArray(raw.plan)) return raw.plan.map(normalizeStepItem).filter(Boolean)
    if (typeof raw.text === 'string') return parseAiSteps(raw.text)
    if (typeof raw.content === 'string') return parseAiSteps(raw.content)
    return []
  }
  if (typeof raw !== 'string') return []

  const s = raw.trim()
  if (!s) return []

  try {
    const parsed = JSON.parse(s)
    const nested = parseAiSteps(parsed)
    if (nested.length) return nested
  } catch {
    /* not JSON */
  }

  return s
    .split(/\n+/)
    .map((line) =>
      cleanQuotedString(
        line
          .replace(/^[\s•\-\*·]+/, '')
          .replace(/^\d+[\.\)]\s*/, '')
          .trim()
      )
    )
    .filter(Boolean)
}

function normalizeStepItem(item) {
  if (item == null) return ''
  if (typeof item === 'string') return cleanQuotedString(item)
  if (typeof item === 'object') {
    const t =
      item.text ??
      item.description ??
      item.title ??
      item.step ??
      item.content ??
      (typeof item.label === 'string' ? item.label : '')
    return cleanQuotedString(String(t))
  }
  return cleanQuotedString(String(item))
}

const S = {
  wrap: {
    background: '#fff',
    borderRadius: 28,
    border: '1.5px solid #f0ede8',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    overflow: 'hidden',
    fontFamily: "'Nunito', 'DM Sans', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '18px 22px',
    borderBottom: '1.5px solid #f0ede8',
    background: 'linear-gradient(135deg, #faf5ff 0%, #f0fdf4 100%)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #7c3aed, #15803d)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(124,58,237,0.25)',
  },
  body: { padding: '20px 22px 24px' },
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    background: '#fafaf8',
    borderRadius: 18,
    padding: '14px 16px',
    border: '1.5px solid #f0ede8',
    marginBottom: 10,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#15803d',
    color: '#fff',
    fontSize: 12,
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
}

export default function AiResultCard({ complaint }) {
  const [imgError, setImgError] = useState(false)

  const rawSteps = complaint?.aiSteps
  const rawImg = getCleanImageRaw(complaint)

  const steps = useMemo(() => parseAiSteps(rawSteps), [rawSteps])
  const hasStepsRaw = (() => {
    if (rawSteps == null) return false
    if (typeof rawSteps === 'string') return rawSteps.trim().length > 0
    if (Array.isArray(rawSteps)) return rawSteps.length > 0
    if (typeof rawSteps === 'object') return Object.keys(rawSteps).length > 0
    return true
  })()
  const hasParsedSteps = steps.length > 0
  const imageUrl = useMemo(() => resolveCleanPreviewUrl(complaint), [complaint])

  useEffect(() => {
    setImgError(false)
  }, [complaint?.id, rawImg])

  if (!hasStepsRaw && !imageUrl) return null

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div style={S.iconBox}>🤖</div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 17,
              fontWeight: 900,
              color: '#1c1917',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            AI cleaning insight
          </p>
          <p style={{ fontSize: 12, color: '#78716c', fontWeight: 600, marginTop: 4 }}>
            Suggested steps and a visual “after clean” preview for this report
          </p>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 800,
            padding: '6px 12px',
            borderRadius: 100,
            background: '#f0fdf4',
            color: '#15803d',
            border: '1.5px solid #bbf7d0',
          }}
        >
          ✓ Ready
        </span>
      </div>

      <div style={S.body}>
        {hasStepsRaw && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>🧹</span>
              <p
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 15,
                  fontWeight: 900,
                  color: '#1c1917',
                }}
              >
                {hasParsedSteps ? `${steps.length}-step plan` : 'Cleaning plan'}
              </p>
            </div>

            {hasParsedSteps ? (
              steps.map((step, i) => (
                <div key={i} style={S.stepRow}>
                  <div style={S.stepNum}>{i + 1}</div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: '#44403c',
                      lineHeight: 1.55,
                      fontWeight: 600,
                    }}
                  >
                    {step}
                  </p>
                </div>
              ))
            ) : (
              <div
                style={{
                  background: '#fafaf8',
                  border: '1.5px solid #f0ede8',
                  borderRadius: 18,
                  padding: '16px 18px',
                  fontSize: 14,
                  color: '#57534e',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontWeight: 600,
                }}
              >
                {typeof rawSteps === 'string'
                  ? rawSteps
                      .split('\n')
                      .map((line) => cleanQuotedString(line))
                      .join('\n')
                  : JSON.stringify(rawSteps, null, 2)}
              </div>
            )}
          </div>
        )}

        {imageUrl && (
          <div style={hasStepsRaw ? { marginTop: 24 } : {}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>🎨</span>
              <p
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 15,
                  fontWeight: 900,
                  color: '#1c1917',
                }}
              >
                After-clean preview
              </p>
            </div>

            {!imgError ? (
              <div
                style={{
                  borderRadius: 22,
                  overflow: 'hidden',
                  border: '1.5px solid #f0ede8',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src={imageUrl}
                  alt="AI suggested clean area"
                  onError={() => setImgError(true)}
                  style={{
                    width: '100%',
                    maxHeight: 380,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#fffdf7',
                    borderTop: '1.5px solid #f0ede8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>✨</span>
                  <p style={{ margin: 0, fontSize: 12, color: '#78716c', fontWeight: 700 }}>
                    Illustrative preview only — actual results depend on work on site.
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 20px',
                  background: '#fafaf8',
                  borderRadius: 22,
                  border: '1.5px solid #f0ede8',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>🖼️</div>
                <p style={{ fontWeight: 800, fontSize: 14, color: '#57534e', margin: 0 }}>
                  Preview image could not be loaded
                </p>
                <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 6, fontWeight: 600 }}>
                  The link may be invalid or the file may no longer be available.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
