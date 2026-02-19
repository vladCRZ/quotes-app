import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Unauthorized from './pages/Unauthorized'
import Quotes from './pages/Quotes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated — any logged-in user */}
          <Route path="/user" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />

          {/* Quotes — any logged-in user */}
          <Route path="/quotes" element={
            <PrivateRoute>
              <Quotes />
            </PrivateRoute>
          } />

          {/* Manager or Admin */}
          <Route path="/manager" element={
            <PrivateRoute requiredRole="ROLE_MANAGER">
              <ManagerDashboard />
            </PrivateRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <PrivateRoute requiredRole="ROLE_ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
