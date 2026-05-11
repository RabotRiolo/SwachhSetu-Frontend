import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/AuthService'

const AuthContext = createContext(null)

const TOKEN_KEY = 'swachhsetu_token'
const USER_KEY  = 'swachhsetu_user'

/** Read JWT + user from localStorage (same keys as Api.jsx interceptor). */
function readPersistedAuth() {
  try {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedToken && savedUser) {
      return { token: savedToken, user: JSON.parse(savedUser) }
    }
    if (savedToken || savedUser) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
  return { token: null, user: null }
}

/** Shared admin check — keep in sync with route guards and nav */
export function userIsAdmin(user) {
  if (!user) return false
  return (
    user.role === 'ADMIN' ||
    user.role === 'admin' ||
    (Array.isArray(user.roles) && (user.roles.includes('ADMIN') || user.roles.includes('admin'))) ||
    user.isAdmin === true
  )
}

export function AuthProvider({ children }) {
  // Single read on mount: first paint must see persisted session so reopening a tab does not flash /login.
  const [{ token, user }, setAuth] = useState(() => {
    const a = readPersistedAuth()
    return { token: a.token, user: a.user }
  })

  // Other tabs / windows: keep auth in sync when localStorage changes
  useEffect(() => {
    const onStorage = (e) => {
      if (e.storageArea !== localStorage) return
      if (e.key !== TOKEN_KEY && e.key !== USER_KEY && e.key != null) return
      const next = readPersistedAuth()
      setAuth({ token: next.token, user: next.user })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials)
    const payload = res.data?.data || res.data || {}
    const jwt = payload.token
    const userData = {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role
    }
    if (!jwt) throw new Error('Login succeeded but token was missing in response')
    localStorage.setItem(TOKEN_KEY, jwt)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setAuth({ token: jwt, user: userData })
    return userData
  }, [])

  // ── Register ─────────────────────────────────────────────
  const register = useCallback(async (data) => {
    const res = await authService.register(data)
    const payload = res.data?.data || res.data || {}
    const jwt = payload.token
    const userData = {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role
    }

    localStorage.setItem(TOKEN_KEY, jwt)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setAuth({ token: jwt, user: userData })
    return userData
  }, [])

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuth({ token: null, user: null })
  }, [])

  // ── Helpers ──────────────────────────────────────────────
  const isLoggedIn = useCallback(() => !!token && !!user, [token, user])
  const isAdmin    = useCallback(() => userIsAdmin(user), [user])
  const getToken   = useCallback(() => token, [token])

  const value = {
    user,
    token,
    loading: false,
    login,
    register,
    logout,
    isLoggedIn,
    isAdmin,
    getToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
