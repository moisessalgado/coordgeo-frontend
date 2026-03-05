import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrgSelector } from '../components/Auth/OrgSelector.tsx'
import { useOrgStore } from '../state/orgStore.ts'

export function OrgSelectPage() {
  const navigate = useNavigate()
  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const organizations = useOrgStore((state) => state.organizations)
  const isLoading = useOrgStore((state) => state.isLoading)
  const error = useOrgStore((state) => state.error)
  const fetchUserOrganizations = useOrgStore((state) => state.fetchUserOrganizations)
  const setActiveOrg = useOrgStore((state) => state.setActiveOrg)

  useEffect(() => {
    if (organizations.length === 0) {
      void fetchUserOrganizations()
    }
  }, [fetchUserOrganizations, organizations.length])

  const handleContinue = () => {
    if (!activeOrgId) {
      return
    }
    navigate('/map', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto mt-20 w-full max-w-2xl">
        <OrgSelector
          organizations={organizations}
          activeOrgId={activeOrgId}
          isLoading={isLoading}
          error={error}
          onSelect={setActiveOrg}
          onContinue={handleContinue}
          onReload={fetchUserOrganizations}
        />
      </div>
    </main>
  )
}
