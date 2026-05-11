import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8084/api'
const TOKEN_KEY = 'swachhsetu_token'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  // ✅ NO global Content-Type here
  // Axios sets it automatically per request:
  //   - plain object  → 'application/json'
  //   - FormData      → 'multipart/form-data; boundary=...'  (with correct boundary)
})

// ── Request interceptor — attach JWT + smart Content-Type ───
api.interceptors.request.use(
  (config) => {
    // Attach auth token
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Only set JSON content-type when body is NOT FormData
    // FormData must be left alone so browser sets boundary automatically
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('swachhsetu_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api