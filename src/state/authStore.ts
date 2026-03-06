import { create } from 'zustand'
import { authService } from '../services/auth.ts'
import { getUserFacingApiError } from '../services/apiErrors.ts'
import type { UserProfile } from '../types/auth.ts'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  setAccessToken: (accessToken: string) => void
  setUserProfile: (userProfile: UserProfile | null) => void
  login: (email: string, password: string) => Promise<void>
  refreshAccessToken: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
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
  userProfile: null,
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

  setUserProfile: (userProfile) => {
    set({ userProfile })
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const tokens = await authService.login({ email, password })
      get().setTokens(tokens.access, tokens.refresh)

      try {
        const userProfile = await authService.fetchCurrentUser()
        get().setUserProfile(userProfile)
      } catch {
        // Perfil é complementar para a UI; não pode bloquear o login.
        get().setUserProfile(null)
      }
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

  fetchCurrentUser: async () => {
    const accessToken = get().accessToken
    if (!accessToken) {
      set({ userProfile: null })
      return
    }

    try {
      const userProfile = await authService.fetchCurrentUser()
      set({ userProfile })
    } catch {
      set({ userProfile: null })
    }
  },

  logout: () => {
    safeStorageRemove(ACCESS_KEY)
    safeStorageRemove(REFRESH_KEY)
    set({ accessToken: null, refreshToken: null, userProfile: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
