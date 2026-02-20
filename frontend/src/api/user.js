import axios from 'axios'

const getCsrf = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ''
}

const headers = () => ({ 'X-XSRF-TOKEN': getCsrf() })

export const updateProfile = (data) =>
    axios.put('/api/users/profile', data, { withCredentials: true, headers: headers() })

export const changePassword = (data) =>
    axios.put('/api/users/password', data, { withCredentials: true, headers: headers() })
