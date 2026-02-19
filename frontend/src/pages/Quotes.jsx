import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getQuotes, createQuote, updateQuote, deleteQuote } from '../quotesApi'

export default function Quotes() {
    const { user } = useAuth()
    const [quotes, setQuotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Add form
    const [addForm, setAddForm] = useState({ content: '', author: '' })
    const [addLoading, setAddLoading] = useState(false)
    const [addError, setAddError] = useState(null)

    // Edit state
    const [editId, setEditId] = useState(null)
    const [editForm, setEditForm] = useState({ content: '', author: '' })
    const [editLoading, setEditLoading] = useState(false)
    const [editError, setEditError] = useState(null)

    // Delete confirm state
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)

    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchQuotes = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getQuotes()
            setQuotes(res.data)
        } catch {
            setError('Failed to load quotes.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchQuotes() }, [fetchQuotes])

    // ── Add ────────────────────────────────────────────────────────────────────

    const handleAdd = async (e) => {
        e.preventDefault()
        setAddLoading(true)
        setAddError(null)
        try {
            const res = await createQuote(addForm)
            setQuotes(prev => [res.data, ...prev])
            setAddForm({ content: '', author: '' })
            showToast('Quote added!')
        } catch (err) {
            setAddError(err.response?.data?.message || 'Failed to add quote.')
        } finally {
            setAddLoading(false)
        }
    }

    // ── Edit ───────────────────────────────────────────────────────────────────

    const startEdit = (q) => {
        setEditId(q.id)
        setEditForm({ content: q.content, author: q.author || '' })
        setEditError(null)
    }

    const cancelEdit = () => { setEditId(null); setEditError(null) }

    const handleSave = async (id) => {
        setEditLoading(true)
        setEditError(null)
        try {
            const res = await updateQuote(id, editForm)
            setQuotes(prev => prev.map(q => q.id === id ? res.data : q))
            setEditId(null)
            showToast('Quote updated!')
        } catch (err) {
            setEditError(err.response?.data?.message || 'Failed to update quote.')
        } finally {
            setEditLoading(false)
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    const handleDelete = async (id) => {
        try {
            await deleteQuote(id)
            setQuotes(prev => prev.filter(q => q.id !== id))
            setConfirmDeleteId(null)
            showToast('Quote deleted.', 'info')
        } catch {
            showToast('Failed to delete quote.', 'error')
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString() : ''

    return (
        <div className="page">
            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' }}>
                    💬 Quotes
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Browse, add, edit and delete quotes — available to all authenticated users.
                </p>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{quotes.length}</div>
                    <div className="stat-label">Total Quotes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">👤</div>
                    <div className="stat-label">Logged in as <strong>{user?.username}</strong></div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">✏️</div>
                    <div className="stat-label">Full CRUD Access</div>
                </div>
            </div>

            {/* Add Quote Form */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    ➕ Add a Quote
                </h2>
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Quote *</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            placeholder="Enter the quote text…"
                            value={addForm.content}
                            onChange={e => setAddForm(f => ({ ...f, content: e.target.value }))}
                            required
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Author</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Marcus Aurelius"
                            value={addForm.author}
                            onChange={e => setAddForm(f => ({ ...f, author: e.target.value }))}
                        />
                    </div>
                    {addError && <div className="alert alert-error">⚠ {addError}</div>}
                    <div>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={addLoading}>
                            {addLoading ? <><span className="spinner" /> Saving…</> : 'Add Quote'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Quotes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <span className="spinner" style={{ display: 'inline-block', marginBottom: '1rem' }} />
                        <p>Loading quotes…</p>
                    </div>
                )}
                {error && <div className="alert alert-error">⚠ {error}</div>}
                {!loading && !error && quotes.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        No quotes yet. Be the first to add one!
                    </div>
                )}
                {quotes.map(q => (
                    <div key={q.id} className="quote-card">
                        {editId === q.id ? (
                            /* Edit mode */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Quote</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        value={editForm.content}
                                        onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Author</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editForm.author}
                                        onChange={e => setEditForm(f => ({ ...f, author: e.target.value }))}
                                    />
                                </div>
                                {editError && <div className="alert alert-error">⚠ {editError}</div>}
                                <div style={{ display: 'flex', gap: '.5rem' }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleSave(q.id)}
                                        disabled={editLoading}
                                    >
                                        {editLoading ? <><span className="spinner" /> Saving…</> : 'Save'}
                                    </button>
                                    <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            /* View mode */
                            <>
                                <p className="quote-content">"{q.content}"</p>
                                <div className="quote-meta">
                                    <span>— <strong>{q.author || 'Unknown'}</strong></span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>
                                        Added by {q.createdBy} · {formatDate(q.createdAt)}
                                    </span>
                                </div>
                                <div className="quote-actions">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => startEdit(q)}
                                    >
                                        ✏ Edit
                                    </button>
                                    {confirmDeleteId === q.id ? (
                                        <>
                                            <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Sure?</span>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(q.id)}
                                            >
                                                Yes, Delete
                                            </button>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => setConfirmDeleteId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => setConfirmDeleteId(q.id)}
                                        >
                                            🗑 Delete
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
