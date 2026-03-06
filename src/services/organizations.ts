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
    { plan: targetPlan }
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
