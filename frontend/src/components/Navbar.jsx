import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleLabel = (roles = []) => {
    if (roles.includes('ROLE_ADMIN')) return { label: 'Admin', cls: 'role-admin' }
    if (roles.includes('ROLE_MANAGER')) return { label: 'Manager', cls: 'role-manager' }
    return { label: 'User', cls: 'role-user' }
}

export default function Navbar() {
    const { user, logout, isAuthenticated, hasRole } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const { label, cls } = roleLabel(user?.roles)

    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-brand">
                <span className="logo-icon">🔐</span> RBAC Demo
            </NavLink>

            <div className="navbar-links">
                <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
                    Home
                </NavLink>
                {isAuthenticated && (
                    <NavLink to="/user" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                        User Zone
                    </NavLink>
                )}
                {isAuthenticated && hasRole('ROLE_MANAGER') && (
                    <NavLink to="/manager" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                        Manager
                    </NavLink>
                )}
                {isAuthenticated && hasRole('ROLE_ADMIN') && (
                    <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                        Admin
                    </NavLink>
                )}
            </div>

            <div className="navbar-user">
                {isAuthenticated ? (
                    <>
                        <div className="user-badge">
                            <span className="dot" />
                            <span>{user.username}</span>
                            <span className={`role-badge ${cls}`}>{label}</span>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign out</button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className="btn btn-outline btn-sm">Login</NavLink>
                        <NavLink to="/register" className="btn btn-primary btn-sm">Register</NavLink>
                    </>
                )}
            </div>
        </nav>
    )
}
