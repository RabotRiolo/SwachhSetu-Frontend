import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home            from './pages/Home'
import Login           from './pages/Login'
import Register        from './pages/Register'
import Profile         from './pages/Profile'
import Dashboard       from './pages/DashBoard'
import Events          from './pages/Events'
import EventDetail     from './pages/EventDetail'
import Articles        from './pages/Articles'
import ArticleDetail   from './pages/ArticleDetail'
import NewComplaint    from './pages/NewComplaint'
import ComplaintDetail from './pages/ComplaintDetail'

import AdminLayout          from './adminpages/AdminLayout'
import AdminDashboard       from './adminpages/AdminDashboard'
import AdminComplaints      from './adminpages/AdminComplaints'
import AdminComplaintDetail from './adminpages/AdminComplaintDetail'
import AdminTeams           from './adminpages/AdminTeams'
import AdminEvents          from './adminpages/AdminEvents'
import AdminArticles        from './adminpages/AdminArticles'


function PublicLayout({ children }) {
  
  return (
    
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── PUBLIC ────────────────────────────────── */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
          <Route path="/events/:id" element={<PublicLayout><EventDetail /></PublicLayout>} />
          <Route path="/articles" element={<PublicLayout><Articles /></PublicLayout>} />
          <Route path="/articles/:id" element={<PublicLayout><ArticleDetail /></PublicLayout>} />

          {/* ── PROTECTED ─────────────────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute><PublicLayout><Dashboard /></PublicLayout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><PublicLayout><Profile /></PublicLayout></ProtectedRoute>
          } />
          <Route path="/complaints/new" element={
            <ProtectedRoute><PublicLayout><NewComplaint /></PublicLayout></ProtectedRoute>
          } />
          <Route path="/complaints/:id" element={
            <ProtectedRoute><PublicLayout><ComplaintDetail /></PublicLayout></ProtectedRoute>
          } />

          {/* ── ADMIN ─────────────────────────────────── */}
          <Route path="/admin" element={
            <AdminRoute><AdminLayout /></AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="complaints/:id" element={<AdminComplaintDetail />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="articles" element={<AdminArticles />} />
          </Route>

          {/* ── 404 ───────────────────────────────────── */}
          <Route path="*" element={
            <PublicLayout>
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="text-8xl mb-6">🍃</div>
                <h1 className="text-4xl font-extrabold text-gray-800 mb-3">404</h1>
                <p className="text-gray-500 mb-8 text-lg">Oops! This page doesn't exist.</p>
                <Link to="/" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold transition inline-block">
                  Go Home
                </Link>
              </div>
            </PublicLayout>
          } />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}