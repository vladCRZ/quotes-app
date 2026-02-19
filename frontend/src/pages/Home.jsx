import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
    const { isAuthenticated, user } = useAuth()
    const [quotes, setQuotes] = useState([])
    const [quotesLoading, setQuotesLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/public/quotes')
            .then(res => setQuotes(res.data))
            .catch(() => setQuotes([]))
            .finally(() => setQuotesLoading(false))
    }, [])

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

            {/* Public Quotes Wall */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '.25rem' }}>
                            💬 Community Quotes
                        </h2>
                        <p style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>
                            Quotes added by our members — anyone can read, members can contribute.
                        </p>
                    </div>
                    {!isAuthenticated && (
                        <Link to="/login" className="btn btn-outline btn-sm">Sign in to add quotes →</Link>
                    )}
                    {isAuthenticated && (
                        <Link to="/quotes" className="btn btn-primary btn-sm">Manage Quotes →</Link>
                    )}
                </div>

                {quotesLoading && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <span className="spinner" style={{ display: 'inline-block' }} />
                    </div>
                )}

                {!quotesLoading && quotes.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No quotes yet.{' '}
                        {isAuthenticated
                            ? <Link to="/quotes">Be the first to add one!</Link>
                            : <Link to="/login">Sign in to add the first one!</Link>}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {quotes.map(q => (
                        <div key={q.id} className="quote-card">
                            <p className="quote-content">"{q.content}"</p>
                            <div className="quote-meta">
                                <span>— <strong>{q.author || 'Unknown'}</strong></span>
                                <span style={{ fontSize: '.75rem' }}>by {q.createdBy}</span>
                            </div>
                        </div>
                    ))}
                </div>
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
