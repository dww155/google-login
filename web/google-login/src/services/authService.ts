export type LoginPayload = {
  username: string
  password: string
}

export type LoginResult = {
  status: number
  message: string
  data: unknown
}

const DEFAULT_BACKEND_URL = 'http://localhost:8080'
const LOGIN_PATH = '/google-login/auth/login'

class AuthApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.data = data
  }
}

const resolveBackendUrl = () => {
  const envUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim()
  return envUrl || DEFAULT_BACKEND_URL
}

const buildLoginUrl = () => {
  const baseUrl = resolveBackendUrl().replace(/\/$/, '')
  return `${baseUrl}${LOGIN_PATH}`
}

const toMessage = (status: number, data: unknown, fallback: string) => {
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data && typeof data === 'object') {
    const dataAsRecord = data as Record<string, unknown>
    const message =
      dataAsRecord.message ?? dataAsRecord.error ?? dataAsRecord.detail
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return `${fallback} (${status})`
}

const parseResponseData = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text()
  } catch {
    return null
  }
}

export const loginWithUsernamePassword = async (
  payload: LoginPayload,
): Promise<LoginResult> => {
  let response: Response

  try {
    response = await fetch(buildLoginUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Khong the ket noi toi server dang nhap.')
  }

  const data = await parseResponseData(response)

  if (!response.ok) {
    throw new AuthApiError(
      toMessage(response.status, data, 'Dang nhap that bai'),
      response.status,
      data,
    )
  }

  return {
    status: response.status,
    message: toMessage(response.status, data, 'Dang nhap thanh cong'),
    data,
  }
}
