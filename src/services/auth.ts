import { api } from './api.ts'
import type { LoginCredentials, TokenResponse } from '../types/auth.ts'
import type { Organization } from '../types/organization.ts'

const parseId = (value: unknown) => String(value)

interface SignupResponse {
  id: number
  email: string
  username: string
}

export const authService = {
  async signup(email: string, password: string) {
    const response = await api.post<SignupResponse>('/auth/register/', { email, password })
    return response.data
  },

  async login(credentials: LoginCredentials) {
    const response = await api.post<TokenResponse>('/token/', credentials)
    return response.data
  },

  async refresh(refreshToken: string) {
    const response = await api.post<{ access: string }>('/token/refresh/', { refresh: refreshToken })
    return response.data.access
  },

  async fetchUserOrganizations() {
    const response = await api.get<Organization[]>('/user/organizations/')
    return response.data.map((organization) => ({
      ...organization,
      id: parseId(organization.id),
    }))
  },

  async fetchDefaultOrganization() {
    const response = await api.get<Organization>('/user/default-organization/')
    return {
      ...response.data,
      id: parseId(response.data.id),
    }
  },
}
