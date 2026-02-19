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
            if (user.roles?.includes('ROLE_ADMIN')) navigate('/admin')
            else if (user.roles?.includes('ROLE_MANAGER')) navigate('/manager')
            else navigate('/user')
        } catch (err) {
            const data = err.response?.data
            setError(data?.message || data?.error || 'Login failed — check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-center">
            <div className="auth-box">
                <div className="card">
                    <h1 className="card-title" style={{ fontSize: '1.75rem' }}>👋 Welcome back</h1>
                    <p className="card-subtitle">Sign in to access your account</p>

                    {error && <div className="alert alert-error">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">Username</label>
                            <input id="username" name="username" className="form-input" type="text"
                                placeholder="Enter your username" value={form.username} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input id="password" name="password" className="form-input" type="password"
                                placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                        </div>
                        <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.875rem', color: 'var(--text-muted)' }}>
                        No account? <Link to="/register">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
