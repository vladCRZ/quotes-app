import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const user = await login(form.username, form.password)
            // Redirect by highest role
            if (user.roles?.includes('ROLE_ADMIN')) navigate('/admin')
            else if (user.roles?.includes('ROLE_MANAGER')) navigate('/manager')
            else navigate('/user')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed — check credentials.')
        } finally {
            setLoading(false)
        }
    }

    const quickLogin = async (username, password) => {
        setForm({ username, password })
        setError('')
        setLoading(true)
        try {
            const user = await login(username, password)
            if (user.roles?.includes('ROLE_ADMIN')) navigate('/admin')
            else if (user.roles?.includes('ROLE_MANAGER')) navigate('/manager')
            else navigate('/user')
        } catch {
            setError('Quick login failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-center">
            <div className="auth-box">
                <div className="card">
                    <h1 className="card-title" style={{ fontSize: '1.75rem' }}>👋 Welcome back</h1>
                    <p className="card-subtitle">Sign in to access protected resources</p>

                    {error && <div className="alert alert-error">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">Username</label>
                            <input id="username" name="username" className="form-input" type="text"
                                placeholder="Enter username" value={form.username} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input id="password" name="password" className="form-input" type="password"
                                placeholder="Enter password" value={form.password} onChange={handleChange} required />
                        </div>
                        <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider">Quick access</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.6rem' }}>
                        {[
                            { label: '👑 Admin', u: 'admin', p: 'admin123', cls: 'role-admin' },
                            { label: '📊 Manager', u: 'manager', p: 'manager123', cls: 'role-manager' },
                            { label: '👤 Alice', u: 'alice', p: 'alice123', cls: 'role-user' },
                        ].map(({ label, u, p, cls }) => (
                            <button key={u} className={`btn btn-outline btn-sm`} onClick={() => quickLogin(u, p)}
                                style={{ fontSize: '.78rem' }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.875rem', color: 'var(--text-muted)' }}>
                        No account? <Link to="/register">Register here</Link>
                    </p>
                </div>

                {/* Credentials hint */}
                <div className="card" style={{ marginTop: '1rem', padding: '1.25rem' }}>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.75rem', fontWeight: 600 }}>
                        🔑 Demo Credentials
                    </p>
                    <table className="creds-table">
                        <thead><tr><th>User</th><th>Password</th><th>Roles</th></tr></thead>
                        <tbody>
                            {[
                                ['admin', 'admin123', 'Admin + Manager + User'],
                                ['manager', 'manager123', 'Manager + User'],
                                ['alice / bob / carol', 'alice/bob/carol + 123', 'User'],
                            ].map(([u, p, r]) => (
                                <tr key={u}>
                                    <td><code>{u}</code></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{p}</td>
                                    <td><span style={{ fontSize: '.75rem', color: 'var(--accent)' }}>{r}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
