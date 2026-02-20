import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword } from '../api/user'

export default function Profile() {
    const { user } = useAuth()
    const [email, setEmail] = useState('')
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            setEmail(user.email || '')
        }
    }, [user])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')
        try {
            const res = await updateProfile({ email })
            setMessage(res.data.message)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile')
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match')
            return
        }
        try {
            const res = await changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            })
            setMessage(res.data.message)
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password')
        }
    }

    return (
        <div className="container fade-in">
            <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                <h2>User Profile</h2>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                    <label>Username</label>
                    <input type="text" className="input" value={user?.username || ''} disabled />
                </div>
                <div className="mb-3">
                    <label>Roles</label>
                    <input type="text" className="input" value={user?.roles?.join(', ') || ''} disabled />
                </div>

                <hr />

                <h3>Update Email</h3>
                <form onSubmit={handleUpdateProfile}>
                    <div className="mb-3">
                        <label>Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Update Email</button>
                </form>

                <hr />

                <h3>Change Password</h3>
                <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                        <label>Current Password</label>
                        <input
                            type="password"
                            className="input"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="input"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            className="input"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary">Change Password</button>
                </form>
            </div>
        </div>
    )
}
