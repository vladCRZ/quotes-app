import axios from 'axios'

const getCsrf = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ''
}

const headers = () => ({ 'X-XSRF-TOKEN': getCsrf() })

export const getQuotes = () =>
    axios.get('/api/quotes', { withCredentials: true })

export const getQuote = (id) =>
    axios.get(`/api/quotes/${id}`, { withCredentials: true })

export const createQuote = (data) =>
    axios.post('/api/quotes', data, { withCredentials: true, headers: headers() })

export const updateQuote = (id, data) =>
    axios.put(`/api/quotes/${id}`, data, { withCredentials: true, headers: headers() })

export const deleteQuote = (id) =>
    axios.delete(`/api/quotes/${id}`, { withCredentials: true, headers: headers() })
