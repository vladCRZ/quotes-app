import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function ManagerDashboard() {
    const { user } = useAuth()
    const [apiResult, setApiResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const callApi = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/api/manager/dashboard', { withCredentials: true })
            setApiResult(res.data)
        } catch (err) {
            setApiResult({ error: err.response?.data?.error || 'Request failed' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>📊 Manager Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Accessible to MANAGER and ADMIN roles only.
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">📊</div>
                    <div className="stat-label">Manager Portal</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">👥</div>
                    <div className="stat-label">Team Access</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">🔐</div>
                    <div className="stat-label">Role-Gated</div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Access Level</h2>
                <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                    {user?.roles?.map(r => {
                        const cls = r.includes('ADMIN') ? 'role-admin' : r.includes('MANAGER') ? 'role-manager' : 'role-user'
                        return <span key={r} className={`role-badge ${cls}`}>{r}</span>
                    })}
                </div>
                <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                    ℹ️ You have elevated access. Regular users cannot reach this dashboard.
                </div>
            </div>

            <div className="card">
                <h2 style={{ fontSize: '1.1rem', marginBottom: '.5rem' }}>🔌 Live API Test</h2>
                <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Call <code>/api/manager/dashboard</code> — requires ROLE_MANAGER or ROLE_ADMIN.
                </p>
                <button className="btn btn-primary btn-sm" onClick={callApi} disabled={loading}>
                    {loading ? <><span className="spinner" /> Calling…</> : 'Call API'}
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
