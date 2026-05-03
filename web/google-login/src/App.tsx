import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { loginWithUsernamePassword } from './services/authService'

type StatusType = 'idle' | 'success' | 'error'

const DEFAULT_BACKEND_URL = 'http://localhost:8080'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusType, setStatusType] = useState<StatusType>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const backendUrl =
    (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ||
    DEFAULT_BACKEND_URL

  const googleLoginUrl = useMemo(
    () => `${backendUrl.replace(/\/$/, '')}/google-login/oauth2/authorization/google`,
    [backendUrl],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedUsername = username.trim()

    if (!normalizedUsername || !password.trim()) {
      setStatusType('error')
      setStatusMessage('Vui long nhap day du username va password.')
      return
    }

    setIsSubmitting(true)
    setStatusType('idle')
    setStatusMessage('Dang xu ly dang nhap...')

    try {
      const result = await loginWithUsernamePassword({
        username: normalizedUsername,
        password,
      })

      setStatusType('success')
      setStatusMessage(result.message)
      setPassword('')
    } catch (error) {
      setStatusType('error')
      setStatusMessage(
        error instanceof Error ? error.message : 'Dang nhap that bai.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = googleLoginUrl
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <p className="eyebrow">Welcome back</p>
        <h1 id="login-title">Dang nhap</h1>
        <p className="subtitle">Nhap thong tin de tiep tuc vao he thong.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Nhap username"
            disabled={isSubmitting}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhap password"
            disabled={isSubmitting}
          />

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Dang xu ly...' : 'Dang nhap'}
          </button>
        </form>

        <div className="divider" role="presentation">
          <span>hoac</span>
        </div>

        <button
          type="button"
          className="btn btn-google"
          onClick={handleGoogleLogin}
        >
          <span className="google-mark" aria-hidden="true">
            G
          </span>
          Dang nhap bang Google
        </button>
        <p className={`status status-${statusType}`} role="status" aria-live="polite">
          {statusMessage || ' '}
        </p>
      </section>
    </main>
  )
}

export default App
