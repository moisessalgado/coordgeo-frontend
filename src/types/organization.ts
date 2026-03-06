export type OrganizationType = 'personal' | 'team'
export type OrganizationPlan = 'free' | 'pro' | 'enterprise'

export interface Organization {
  id: string
  name: string
  slug: string
  description: string
  org_type: OrganizationType
  plan: OrganizationPlan
  created_at: string
}
