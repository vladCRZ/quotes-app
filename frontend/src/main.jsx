import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// ── Axios global defaults ─────────────────────────────────────────────────────
// Always send the session cookie so Spring Security can identify the user.
axios.defaults.withCredentials = true

// CSRF double-submit cookie pattern:
// Spring Boot sets an XSRF-TOKEN cookie (readable by JS, not HttpOnly).
// Axios reads this cookie automatically and echoes it back as X-XSRF-TOKEN
// on every mutating request (POST, PUT, DELETE, PATCH).
// Spring Security validates header == cookie value, blocking CSRF attacks.
axios.defaults.xsrfCookieName = 'XSRF-TOKEN'
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
