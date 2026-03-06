import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrgSelector } from '../components/Auth/OrgSelector.tsx'
import { Navbar } from '../components/Navbar.tsx'
import { Footer } from '../components/Footer.tsx'
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
    const loadOrganizations = async () => {
      try {
        await fetchUserOrganizations()
      } catch {
        // Erro já tratado no store
      }
    }

    void loadOrganizations()
  }, [fetchUserOrganizations])

  const handleContinue = () => {
    if (!activeOrgId) {
      return
    }
    navigate('/map', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar />
      <main className="flex flex-1 flex-col justify-center p-6">
        <div className="mx-auto w-full max-w-2xl">
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
      <Footer />
    </div>
  )
}
