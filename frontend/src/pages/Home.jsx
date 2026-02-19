import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function Home() {
    const { isAuthenticated } = useAuth()
    const [quotes, setQuotes] = useState([])
    const [featured, setFeatured] = useState(null)
    const [loading, setLoading] = useState(true)
    const heroRef = useRef(null)

    useEffect(() => {
        axios.get('/api/public/quotes')
            .then(res => {
                const data = res.data
                setQuotes(data)
                if (data.length > 0) {
                    setFeatured(data[Math.floor(Math.random() * data.length)])
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const handleNewFeatured = () => {
        if (quotes.length < 2) return
        setFeatured(prev => {
            const rest = quotes.filter(q => q.id !== prev?.id)
            return rest[Math.floor(Math.random() * rest.length)]
        })
    }

    return (
        <div className="page" style={{ padding: 0, maxWidth: '100%' }}>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section
                ref={heroRef}
                style={{
                    minHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '4rem 1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Radial glow blobs */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                    background: `
                        radial-gradient(ellipse 60% 40% at 20% 30%, rgba(108,99,255,.18) 0%, transparent 70%),
                        radial-gradient(ellipse 50% 35% at 80% 70%, rgba(76,201,240,.13) 0%, transparent 65%)
                    `,
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 780 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                        background: 'rgba(108,99,255,.12)', border: '1px solid rgba(108,99,255,.3)',
                        borderRadius: 999, padding: '.35rem 1rem',
                        fontSize: '.78rem', fontWeight: 700, letterSpacing: '.08em',
                        color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '1.75rem',
                    }}>
                        💬 Quotr
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
                        fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem',
                        background: 'linear-gradient(135deg, #fff 30%, rgba(108,99,255,.9) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Words that<br />move you.
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                        color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 2.5rem',
                        lineHeight: 1.7,
                    }}>
                        Discover timeless wisdom, share your favourite quotes, and build
                        a collection that inspires you every day.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isAuthenticated ? (
                            <Link to="/quotes" className="btn btn-primary">
                                ✏️ Add a Quote
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary">
                                    Get Started — it's free
                                </Link>
                                <Link to="/login" className="btn btn-outline">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Scroll hint */}
                <div style={{
                    position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem',
                    color: 'var(--text-muted)', fontSize: '.75rem', opacity: .6,
                    animation: 'fadeInUp .6s ease 1s both',
                }}>
                    <span>scroll</span>
                    <span style={{ fontSize: '1.1rem' }}>↓</span>
                </div>
            </section>

            {/* ── Featured Quote ────────────────────────────────────────────── */}
            {!loading && featured && (
                <section style={{
                    padding: '5rem 1.5rem',
                    background: 'linear-gradient(180deg, rgba(108,99,255,.06) 0%, transparent 100%)',
                }}>
                    <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                        <div style={{
                            fontSize: '.78rem', fontWeight: 700, letterSpacing: '.1em',
                            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '2rem',
                        }}>
                            ✨ Featured Quote
                        </div>

                        <div style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 20,
                            padding: '3rem 2.5rem',
                            boxShadow: '0 24px 80px rgba(108,99,255,.12)',
                            position: 'relative',
                        }}>
                            <div style={{
                                position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                                width: 80, height: 3,
                                background: 'linear-gradient(90deg, var(--accent), #4cc9f0)',
                                borderRadius: 999,
                            }} />

                            <p style={{
                                fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
                                fontStyle: 'italic', lineHeight: 1.7,
                                color: 'var(--text)', marginBottom: '1.5rem',
                            }}>
                                "{featured.content}"
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>
                                — {featured.author || 'Unknown'}
                            </p>
                        </div>

                        {quotes.length > 1 && (
                            <button
                                onClick={handleNewFeatured}
                                className="btn btn-outline"
                                style={{ marginTop: '1.5rem', fontSize: '.875rem' }}
                            >
                                🎲 Show another
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* ── All Quotes Wall ───────────────────────────────────────────── */}
            <section style={{ padding: '5rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-between', flexWrap: 'wrap',
                    gap: '1rem', marginBottom: '2.5rem',
                }}>
                    <div>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '.4rem' }}>
                            Community Quotes
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '.95rem' }}>
                            {quotes.length} quote{quotes.length !== 1 ? 's' : ''} from the community
                        </p>
                    </div>
                    {isAuthenticated ? (
                        <Link to="/quotes" className="btn btn-primary btn-sm">
                            + Add yours
                        </Link>
                    ) : (
                        <Link to="/register" className="btn btn-outline btn-sm">
                            Join to contribute →
                        </Link>
                    )}
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        Loading quotes…
                    </div>
                )}

                {!loading && quotes.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '4rem',
                        color: 'var(--text-muted)',
                        background: 'var(--surface)', borderRadius: 16,
                        border: '1px solid var(--border)',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪴</div>
                        <p>No quotes yet. Be the first to plant a seed!</p>
                        <Link to="/register" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                            Get Started
                        </Link>
                    </div>
                )}

                <div style={{
                    columns: 'auto 300px', gap: '1.25rem',
                }}>
                    {quotes.map(q => (
                        <div key={q.id} className="quote-card" style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}>
                            <p className="quote-content">"{q.content}"</p>
                            <div className="quote-meta">
                                <span>— <strong>{q.author || 'Unknown'}</strong></span>
                                <span style={{ fontSize: '.75rem' }}>by {q.createdBy}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ───────────────────────────────────────────────── */}
            {!isAuthenticated && (
                <section style={{
                    padding: '5rem 1.5rem',
                    textAlign: 'center',
                    background: `
                        radial-gradient(ellipse 70% 60% at 50% 50%, rgba(108,99,255,.14) 0%, transparent 70%)
                    `,
                    borderTop: '1px solid var(--border)',
                    marginTop: '3rem',
                }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800,
                        marginBottom: '.75rem',
                    }}>
                        Ready to share your wisdom?
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                        Join Quotr and start adding quotes that inspire.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary">Create a free account</Link>
                        <Link to="/login" className="btn btn-outline">Sign In</Link>
                    </div>
                </section>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    to   { opacity: .6; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    )
}
