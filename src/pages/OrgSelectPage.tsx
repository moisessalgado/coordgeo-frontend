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
  const isFreemium = useOrgStore((state) => state.isFreemium)
  const fetchUserOrganizations = useOrgStore((state) => state.fetchUserOrganizations)
  const fetchAndSetDefaultOrg = useOrgStore((state) => state.fetchAndSetDefaultOrg)
  const setActiveOrg = useOrgStore((state) => state.setActiveOrg)

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        await fetchUserOrganizations()
      } catch {
        // Erro já tratado no store
      }
    }

    if (organizations.length === 0) {
      void loadOrganizations()
    }
  }, [fetchUserOrganizations, organizations.length])

  // Se usuário freemium (sem orgs visíveis), auto-selecionar org padrão
  useEffect(() => {
    const autoSelectDefaultOrg = async () => {
      if (isFreemium && !isLoading && !activeOrgId) {
        try {
          await fetchAndSetDefaultOrg()
          // Redirecionar automaticamente para o mapa
          navigate('/map', { replace: true })
        } catch {
          // Erro já tratado no store
        }
      }
    }

    void autoSelectDefaultOrg()
  }, [isFreemium, isLoading, activeOrgId, fetchAndSetDefaultOrg, navigate])

  const handleContinue = () => {
    if (!activeOrgId) {
      return
    }
    navigate('/map', { replace: true })
  }

  // Se é freemium, mostrar loading enquanto busca org padrão
  if (isFreemium && isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto mt-20 w-full max-w-2xl text-center">
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <p className="text-slate-600">Configurando seu workspace...</p>
          </div>
        </div>
      </main>
    )
  }

  // Se é freemium e não conseguiu carregar, mostrar erro
  if (isFreemium && error) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto mt-20 w-full max-w-2xl text-center">
          <div className="rounded-xl border border-red-200 bg-white p-8">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    )
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
