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
  clearOrgSession: () => void
  fetchUserOrganizations: () => Promise<void>
  fetchAndSetDefaultOrg: () => Promise<void>
  resolveAndSetActiveOrg: () => Promise<string | null>
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

const pickPreferredOrganization = (organizations: Organization[]) => {
  const teamOrg = organizations.find((organization) => organization.org_type === 'team')
  if (teamOrg) {
    return teamOrg
  }

  return organizations.find((organization) => organization.org_type === 'personal') ?? null
}

export const useOrgStore = create<OrgState>((set, get) => ({
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

  clearOrgSession: () => {
    safeStorageRemove(ORG_KEY)
    set({
      activeOrgId: null,
      organizations: [],
      isFreemium: false,
      isLoading: false,
      error: null,
    })
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

  resolveAndSetActiveOrg: async (): Promise<string | null> => {
    const { activeOrgId } = get()

    if (activeOrgId) {
      return activeOrgId
    }

    set({ isLoading: true, error: null })

    try {
      const organizations = await authService.fetchUserOrganizations()
      const preferredOrganization = pickPreferredOrganization(organizations)

      if (preferredOrganization) {
        safeStorageSet(ORG_KEY, preferredOrganization.id)
        set({
          activeOrgId: preferredOrganization.id,
          organizations,
          isFreemium: organizations.length === 0,
        })
        return preferredOrganization.id
      }

      const defaultOrg = await authService.fetchDefaultOrganization()
      safeStorageSet(ORG_KEY, defaultOrg.id)
      set({
        activeOrgId: defaultOrg.id,
        organizations,
        isFreemium: organizations.length === 0,
      })
      return defaultOrg.id
    } catch (error) {
      set({
        error: getUserFacingApiError(error, {
          context: 'organization',
          fallbackMessage: 'Não foi possível definir a organização ativa.',
        }),
      })
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
