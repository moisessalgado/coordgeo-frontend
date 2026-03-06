import { create } from 'zustand'
import { authService } from '../services/auth.ts'
import { getUserFacingApiError } from '../services/apiErrors.ts'
import type { Organization } from '../types/organization.ts'

interface OrgState {
  activeOrgId: string | null
  organizations: Organization[]
  isLoading: boolean
  error: string | null
  isFreemium: boolean
  setActiveOrg: (orgId: string) => void
  clearActiveOrg: () => void
  fetchUserOrganizations: () => Promise<void>
  fetchAndSetDefaultOrg: () => Promise<void>
  clearError: () => void
}

const ORG_KEY = 'coordgeo.activeOrgId'

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

export const useOrgStore = create<OrgState>((set) => ({
  activeOrgId: safeStorageGet(ORG_KEY),
  organizations: [],
  isLoading: false,
  error: null,
  isFreemium: false,

  setActiveOrg: (orgId) => {
    safeStorageSet(ORG_KEY, orgId)
    set({ activeOrgId: orgId })
  },

  clearActiveOrg: () => {
    safeStorageRemove(ORG_KEY)
    set({ activeOrgId: null })
  },

  fetchUserOrganizations: async () => {
    set({ isLoading: true, error: null })
    try {
      const organizations = await authService.fetchUserOrganizations()
      const isFreemium = organizations.length === 0
      set({ organizations, isFreemium })
    } catch (error) {
      set({
        error: getUserFacingApiError(error, {
          context: 'organization',
          fallbackMessage: 'Não foi possível carregar as organizações.',
        }),
      })
      throw new Error('organizations_fetch_failed')
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAndSetDefaultOrg: async () => {
    set({ isLoading: true, error: null })
    try {
      const defaultOrg = await authService.fetchDefaultOrganization()
      safeStorageSet(ORG_KEY, defaultOrg.id)
      set({ activeOrgId: defaultOrg.id, isFreemium: true })
    } catch (error) {
      set({
        error: getUserFacingApiError(error, {
          context: 'organization',
          fallbackMessage: 'Não foi possível carregar a organização padrão.',
        }),
      })
      throw new Error('default_org_fetch_failed')
    } finally {
      set({ isLoading: false })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
