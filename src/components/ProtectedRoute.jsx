import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, userIsAdmin } from '../contexts/AuthContext'

export function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  const location       = useLocation()

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { isLoggedIn, user } = useAuth()
  const location             = useLocation()

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!userIsAdmin(user)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
