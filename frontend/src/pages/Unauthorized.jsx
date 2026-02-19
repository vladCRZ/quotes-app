import { Link, useNavigate } from 'react-router-dom'

export default function Unauthorized() {
    const navigate = useNavigate()

    return (
        <div className="page-center">
            <div style={{ textAlign: 'center', maxWidth: 480 }}>
                <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '1.5rem' }}>🚫</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.75rem', color: 'var(--red)' }}>
                    Access Denied
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                    You don't have the required role to access this resource.
                    Ask an administrator to upgrade your permissions.
                </p>

                <div className="alert alert-error" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    🔒 Insufficient privileges for this page.
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}>← Go Back</button>
                    <Link to="/" className="btn btn-primary">🏠 Home</Link>
                </div>
            </div>
        </div>
    )
}
