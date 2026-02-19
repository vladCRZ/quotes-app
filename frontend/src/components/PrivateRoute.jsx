import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, requiredRole }) {
    const { user, loading, isAuthenticated, hasRole } = useAuth()

    if (loading) {
        return (
            <div className="page-center">
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            </div>
        )
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />
    if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/unauthorized" replace />

    return children
}
