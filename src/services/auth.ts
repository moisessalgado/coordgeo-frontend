import { api } from './api.ts'
import type { LoginCredentials, TokenResponse } from '../types/auth.ts'
import type { Organization } from '../types/organization.ts'

const parseId = (value: unknown) => String(value)

export const authService = {
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
}
