import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { trackApiFailure } from './apiErrors.ts'

interface InterceptorBridge {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setAccessToken: (accessToken: string) => void
  clearSession: () => void
  getActiveOrgId: () => string | null
}

type RetryableRequest = InternalAxiosRequestConfig & {
  _retryAuth?: boolean
  _networkRetryCount?: number
}

const NETWORK_RETRY_LIMIT = 2
const NETWORK_RETRY_DELAY_MS = 350

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '')

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
)

const unaffiliatedPaths = ['/token/', '/token/refresh/', '/user/profile/', '/user/organizations/', '/user/default-organization/', '/organizations/create-team/', '/auth/register/']

const requiresOrgHeader = (path: string) => {
  return !unaffiliatedPaths.some((basePath) => path.includes(basePath))
}

export const api = axios.create({
  baseURL: API_BASE_URL,
})

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const isIdempotentMethod = (method?: string) => {
  const normalized = (method ?? 'get').toLowerCase()
  return normalized === 'get' || normalized === 'head' || normalized === 'options'
}

const shouldRetryNetworkError = (error: AxiosError, request: RetryableRequest) => {
  if (error.response) {
    return false
  }

  if (!isIdempotentMethod(request.method)) {
    return false
  }

  const retries = request._networkRetryCount ?? 0
  return retries < NETWORK_RETRY_LIMIT
}

let configured = false

export const configureApiInterceptors = (bridge: InterceptorBridge) => {
  if (configured) {
    return
  }

  api.interceptors.request.use((config) => {
    const accessToken = bridge.getAccessToken()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    const requestUrl = config.url ?? ''
    if (requiresOrgHeader(requestUrl)) {
      const activeOrgId = bridge.getActiveOrgId()
      if (activeOrgId) {
        config.headers['X-Organization-ID'] = activeOrgId
      }
    }

    return config
  })

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequest | undefined
      if (!originalRequest) {
        trackApiFailure(error)
        return Promise.reject(error)
      }

      if (shouldRetryNetworkError(error, originalRequest)) {
        originalRequest._networkRetryCount = (originalRequest._networkRetryCount ?? 0) + 1
        await sleep(NETWORK_RETRY_DELAY_MS * originalRequest._networkRetryCount)
        return api.request(originalRequest)
      }

      if (error.response?.status !== 401 || originalRequest._retryAuth) {
        trackApiFailure(error)
        return Promise.reject(error)
      }

      const refreshToken = bridge.getRefreshToken()
      if (!refreshToken) {
        bridge.clearSession()
        trackApiFailure(error)
        return Promise.reject(error)
      }

      originalRequest._retryAuth = true

      try {
        const response = await axios.post<{ access: string }>(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        })
        const accessToken = response.data.access
        bridge.setAccessToken(accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api.request(originalRequest)
      } catch {
        bridge.clearSession()
        trackApiFailure(error)
        return Promise.reject(error)
      }
    },
  )

  configured = true
}
