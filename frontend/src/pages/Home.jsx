import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
    const { isAuthenticated, user } = useAuth()

    return (
        <div className="page">
            <div className="hero">
                <h1>Role-Based Access Control</h1>
                <p>A full-stack RBAC demo built with <strong>Spring Boot 3</strong>, <strong>H2</strong>, <strong>React</strong> &amp; <strong>Vite</strong>. Every resource is protected by fine-grained role checks.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {isAuthenticated ? (
                        <Link to="/user" className="btn btn-primary">Go to Dashboard →</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary">Sign In →</Link>
                            <Link to="/register" className="btn btn-outline">Create Account</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Feature cards */}
            <div className="features-grid" style={{ marginBottom: '2.5rem' }}>
                {[
                    { icon: '👑', title: 'Admin Role', desc: 'Full access: user management, all dashboards, admin endpoints.' },
                    { icon: '📊', title: 'Manager Role', desc: 'Access to manager and user dashboards. Cannot access admin-only features.' },
                    { icon: '👤', title: 'User Role', desc: 'Standard member. Can access the user dashboard only.' },
                    { icon: '🔒', title: 'Protected Routes', desc: 'React Router guards redirect unauthenticated or unauthorised users.' },
                    { icon: '🗄️', title: 'H2 In-Memory DB', desc: 'Pre-seeded with 5 demo users across 3 roles on every startup.' },
                    { icon: '🍪', title: 'Session Auth', desc: 'HTTP session cookies — no JWTs to manage in the client.' },
                ].map(f => (
                    <div className="feature-card" key={f.title}>
                        <div className="feature-icon">{f.icon}</div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* Architecture */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🏗️ Stack</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem', fontSize: '.875rem' }}>
                    {[
                        ['Backend', 'Java 21 · Spring Boot 3.2 · Spring Security 6'],
                        ['Database', 'H2 in-memory · Spring Data JPA · Hibernate 6'],
                        ['Frontend', 'React 18 · Vite 6 · Axios · React Router v6'],
                        ['Build', 'Maven (backend) · npm (frontend)'],
                    ].map(([k, v]) => (
                        <div key={k} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '.75rem 1rem' }}>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.2rem' }}>{k}</div>
                            <div style={{ fontWeight: 500 }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
