import { api } from './api.ts'

export interface Organization {
  id: string
  name: string
  slug: string
  description: string
  org_type: 'personal' | 'team'
  plan: 'free' | 'pro' | 'enterprise'
  owner: string
  created_at: string
  updated_at: string
}

/**
 * Upgrade an organization's plan to PRO (or another plan)
 * Only organization admins can upgrade
 */
export async function upgradeOrganizationPlan(
  organizationId: string,
  targetPlan: 'pro' | 'enterprise'
): Promise<Organization> {
  const response = await api.post<Organization>(
    `/organizations/${organizationId}/upgrade/`,
    { plan: targetPlan },
    {
      // Keep URL organization and org-header in sync for this org-scoped action.
      headers: {
        'X-Organization-ID': organizationId,
      },
    }
  )
  return response.data
}

/**
 * Get organization details
 */
export async function getOrganization(organizationId: string): Promise<Organization> {
  const response = await api.get<Organization>(`/organizations/${organizationId}/`)
  return response.data
}

/**
 * Create a new TEAM organization.
 * Requires user to have PRO plan in at least one organization.
 * User automatically becomes owner and admin.
 *
 * POST /api/v1/organizations/create-team/
 * Body: { "name": "...", "slug": "...", "description": "..." }
 */
export async function createTeamOrganization(
  name: string,
  slug: string,
  description: string = '',
): Promise<Organization> {
  const response = await api.post<Organization>('/organizations/create-team/', {
    name,
    slug,
    description,
  })
  return response.data
}
