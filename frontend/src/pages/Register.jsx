import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Register() {
    const [form, setForm] = useState({ username: '', password: '', email: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setError(''); setSuccess('')
        setLoading(true)
        try {
            const res = await axios.post('/api/auth/register', form, { withCredentials: true })
            setSuccess(`✅ Account created! Redirecting to login…`)
            setTimeout(() => navigate('/login'), 1800)
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-center">
            <div className="auth-box">
                <div className="card">
                    <h1 className="card-title" style={{ fontSize: '1.75rem' }}>🚀 Create Account</h1>
                    <p className="card-subtitle">Register to get started with RBAC Demo</p>

                    {error && <div className="alert alert-error">⚠️ {error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-username">Username</label>
                            <input id="reg-username" name="username" className="form-input" type="text"
                                placeholder="Pick a username (min 3 chars)" value={form.username} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                            <input id="reg-email" name="email" className="form-input" type="email"
                                placeholder="you@example.com" value={form.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-password">Password</label>
                            <input id="reg-password" name="password" className="form-input" type="password"
                                placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                        </div>
                        <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.875rem', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
