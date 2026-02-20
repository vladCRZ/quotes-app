import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

// ── Like button component ────────────────────────────────────────────────────
function LikeButton({ quoteId, likeCount, likedByMe, isAuthenticated, onToggle }) {
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        if (!isAuthenticated || loading) return
        setLoading(true)
        try {
            const res = await axios.post(`/api/quotes/${quoteId}/like`, {}, { withCredentials: true })
            onToggle(res.data)
        } catch { /* silently ignore */ }
        finally { setLoading(false) }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            title={isAuthenticated ? (likedByMe ? 'Unlike' : 'Like') : 'Sign in to like'}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '.35rem',
                background: 'none', border: 'none', cursor: isAuthenticated ? 'pointer' : 'default',
                color: likedByMe ? '#e45b5b' : 'var(--text-muted)',
                fontSize: '.85rem', fontWeight: 600, padding: '0',
                transition: 'color .2s, transform .15s',
                opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={e => isAuthenticated && (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
            <span style={{ fontSize: '1.05rem' }}>{likedByMe ? '❤️' : '🤍'}</span>
            {likeCount > 0 && <span>{likeCount}</span>}
        </button>
    )
}

export default function CommunityQuotes() {
    const { isAuthenticated } = useAuth()
    const [quotes, setQuotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('newest')

    const fetchQuotes = useCallback(() => {
        setLoading(true)
        axios.get('/api/quotes', { withCredentials: true })
            .then(res => setQuotes(res.data))
            .catch(() => setError('Failed to load quotes. Please try again later.'))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { fetchQuotes() }, [fetchQuotes])

    const handleToggle = (updated) => {
        setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q))
    }

    const filtered = useMemo(() => {
        let result = [...quotes]
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(qt =>
                qt.content?.toLowerCase().includes(q) ||
                qt.author?.toLowerCase().includes(q) ||
                qt.createdBy?.toLowerCase().includes(q)
            )
        }
        if (sortBy === 'newest') result.sort((a, b) => b.id - a.id)
        else if (sortBy === 'oldest') result.sort((a, b) => a.id - b.id)
        else if (sortBy === 'author') result.sort((a, b) => (a.author || '').localeCompare(b.author || ''))
        else if (sortBy === 'liked') result.sort((a, b) => b.likeCount - a.likeCount)
        return result
    }, [quotes, search, sortBy])

    return (
        <div className="page">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                    background: 'rgba(108,99,255,.1)', border: '1px solid rgba(108,99,255,.25)',
                    borderRadius: 999, padding: '.3rem .9rem',
                    fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em',
                    color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '1rem',
                }}>
                    💬 Community
                </div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '.5rem' }}>
                    Community Quotes
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>
                    {quotes.length > 0
                        ? `${quotes.length} quote${quotes.length !== 1 ? 's' : ''} shared by the community`
                        : 'Wisdom shared by our members'}
                </p>

                {/* CTA for guests */}
                {!isAuthenticated && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        flexWrap: 'wrap',
                        background: 'rgba(108,99,255,.08)',
                        border: '1px solid rgba(108,99,255,.2)',
                        borderRadius: 12, padding: '1rem 1.25rem',
                    }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
                            ✨ Want to add and like quotes?
                        </span>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Link to="/register" className="btn btn-primary btn-sm">Join for free</Link>
                            <Link to="/login" className="btn btn-outline btn-sm">Sign in</Link>
                        </div>
                    </div>
                )}
                {isAuthenticated && (
                    <Link to="/quotes" className="btn btn-primary btn-sm">
                        + Add a quote
                    </Link>
                )}
            </div>

            {/* ── Search & Sort ───────────────────────────────────────────── */}
            <div style={{
                display: 'flex', gap: '1rem', flexWrap: 'wrap',
                marginBottom: '2rem', alignItems: 'center',
            }}>
                <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                    <span style={{
                        position: 'absolute', left: '1rem', top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)',
                        pointerEvents: 'none', fontSize: '1rem',
                    }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search quotes, authors…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', paddingLeft: '2.5rem',
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            borderRadius: 8, padding: '.65rem 1rem .65rem 2.5rem',
                            color: 'var(--text)', fontSize: '.95rem',
                            outline: 'none', transition: 'border-color .2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                </div>

                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '.65rem 1rem',
                        color: 'var(--text)', fontSize: '.9rem', cursor: 'pointer',
                    }}
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="author">By author</option>
                    <option value="liked">Most liked</option>
                </select>
            </div>

            {/* ── States ─────────────────────────────────────────────────── */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    Loading quotes…
                </div>
            )}

            {error && (
                <div style={{
                    background: 'rgba(239,68,68,.1)', border: '1px solid var(--red)',
                    borderRadius: 10, padding: '1.25rem 1.5rem', color: '#fca5a5',
                    fontSize: '.95rem', marginBottom: '1.5rem',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div style={{
                    textAlign: 'center', padding: '4rem',
                    background: 'var(--surface)', borderRadius: 16,
                    border: '1px dashed var(--border)', color: 'var(--text-muted)',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    {search
                        ? <>No quotes matching "<strong>{search}</strong>"</>
                        : <><Link to="/register">Be the first!</Link></>}
                </div>
            )}

            {/* ── Quote Grid ─────────────────────────────────────────────── */}
            {!loading && !error && filtered.length > 0 && (
                <div style={{ columns: 'auto 300px', gap: '1.25rem' }}>
                    {filtered.map(q => (
                        <div key={q.id} className="quote-card" style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}>
                            <p className="quote-content">"{q.content}"</p>
                            <div className="quote-meta">
                                <span>— <strong>{q.author || 'Unknown'}</strong></span>
                                <span style={{ fontSize: '.75rem' }}>by {q.createdBy}</span>
                            </div>
                            <div style={{ marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid var(--border)' }}>
                                <LikeButton
                                    quoteId={q.id}
                                    likeCount={q.likeCount}
                                    likedByMe={q.likedByMe}
                                    isAuthenticated={isAuthenticated}
                                    onToggle={handleToggle}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
