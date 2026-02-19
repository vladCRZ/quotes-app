import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore session on mount
    useEffect(() => {
        axios.get('/api/auth/me', { withCredentials: true })
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const login = useCallback(async (username, password) => {
        const res = await axios.post('/api/auth/login', { username, password }, { withCredentials: true })
        setUser(res.data)
        return res.data
    }, [])

    const logout = useCallback(async () => {
        await axios.post('/api/auth/logout', {}, { withCredentials: true })
        setUser(null)
    }, [])

    const hasRole = useCallback((role) => {
        if (!user?.roles) return false
        return user.roles.includes(role)
    }, [user])

    const isAuthenticated = !!user

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
