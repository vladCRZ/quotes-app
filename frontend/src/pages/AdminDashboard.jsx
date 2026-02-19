import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function AdminDashboard() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [apiResult, setApiResult] = useState(null)
    const [calling, setCalling] = useState(false)

    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            const res = await axios.get('/api/admin/users', { withCredentials: true })
            setUsers(res.data)
        } catch (e) {
            setUsers([])
        } finally {
            setLoadingUsers(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])

    const callAdminApi = async () => {
        setCalling(true)
        try {
            const res = await axios.get('/api/admin/dashboard', { withCredentials: true })
            setApiResult(res.data)
        } catch (err) {
            setApiResult({ error: err.response?.data?.error || 'Request failed' })
        } finally {
            setCalling(false)
        }
    }

    return (
        <div className="page">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>👑 Admin Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Full system access — ADMIN role required.</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">3</div>
                    <div className="stat-label">Roles in System</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">👑</div>
                    <div className="stat-label">Admin Access</div>
                </div>
            </div>

            {/* User management table */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.1rem' }}>👥 User Management</h2>
                    <button className="btn btn-outline btn-sm" onClick={fetchUsers} disabled={loadingUsers}>
                        {loadingUsers ? 'Refreshing…' : '↻ Refresh'}
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Username</th><th>Email</th><th>Roles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                                            {u.roles.map(r => {
                                                const cls = r.includes('ADMIN') ? 'role-admin' : r.includes('MANAGER') ? 'role-manager' : 'role-user'
                                                return <span key={r} className={`role-badge ${cls}`}>{r.replace('ROLE_', '')}</span>
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* API Test */}
            <div className="card">
                <h2 style={{ fontSize: '1.1rem', marginBottom: '.5rem' }}>🔌 Live API Test</h2>
                <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Call <code>/api/admin/dashboard</code> — ADMIN only.
                </p>
                <button className="btn btn-primary btn-sm" onClick={callAdminApi} disabled={calling}>
                    {calling ? <><span className="spinner" /> Calling…</> : 'Call API'}
                </button>
                {apiResult && (
                    <div className="endpoint-demo">
                        <div className="endpoint-label">Response</div>
                        <pre>{JSON.stringify(apiResult, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}
