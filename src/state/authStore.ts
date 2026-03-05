import { create } from 'zustand'
import { authService } from '../services/auth.ts'
import { getUserFacingApiError } from '../services/apiErrors.ts'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  setAccessToken: (accessToken: string) => void
  login: (email: string, password: string) => Promise<void>
  refreshAccessToken: () => Promise<void>
  logout: () => void
  clearError: () => void
}

const ACCESS_KEY = 'coordgeo.accessToken'
const REFRESH_KEY = 'coordgeo.refreshToken'

const safeStorageGet = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

const safeStorageRemove = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    return
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: safeStorageGet(ACCESS_KEY),
  refreshToken: safeStorageGet(REFRESH_KEY),
  isLoading: false,
  error: null,

  setTokens: (accessToken, refreshToken) => {
    safeStorageSet(ACCESS_KEY, accessToken)
    safeStorageSet(REFRESH_KEY, refreshToken)
    set({ accessToken, refreshToken, error: null })
  },

  setAccessToken: (accessToken) => {
    safeStorageSet(ACCESS_KEY, accessToken)
    set({ accessToken })
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const tokens = await authService.login({ email, password })
      get().setTokens(tokens.access, tokens.refresh)
    } catch (error) {
      set({
        error: getUserFacingApiError(error, {
          context: 'auth',
          fallbackMessage: 'Falha no login. Verifique suas credenciais.',
        }),
      })
      throw new Error('login_failed')
    } finally {
      set({ isLoading: false })
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken
    if (!refreshToken) {
      throw new Error('refresh_token_missing')
    }

    const accessToken = await authService.refresh(refreshToken)
    get().setAccessToken(accessToken)
  },

  logout: () => {
    safeStorageRemove(ACCESS_KEY)
    safeStorageRemove(REFRESH_KEY)
    set({ accessToken: null, refreshToken: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
