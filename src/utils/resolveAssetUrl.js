/** Same host as Spring Boot static files (uploads). Override with VITE_API_ORIGIN in .env */
const ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:8084').replace(/\/$/, '')

function stripOuterQuotes(s) {
  let t = s.trim()
  while (
    t.length >= 2 &&
    ((t[0] === '"' && t[t.length - 1] === '"') || (t[0] === "'" && t[t.length - 1] === "'"))
  ) {
    t = t.slice(1, -1).trim()
  }
  return t
}

/**
 * Backend often returns paths like /uploads/... — prefix origin when needed.
 * Also handles JSON-quoted strings and protocol-relative URLs.
 */
export default function resolveAssetUrl(url) {
  if (url == null || typeof url !== 'string') return ''
  let t = stripOuterQuotes(url)
  if (!t) return ''
  if (t.startsWith('//')) t = `https:${t}`
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('data:') || t.startsWith('blob:')) return t
  return t.startsWith('/') ? `${ORIGIN}${t}` : `${ORIGIN}/${t}`
}
