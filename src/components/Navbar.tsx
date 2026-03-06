import { Link } from 'react-router-dom'
import { useAuthStore } from '../state/authStore.ts'
import { useOrgStore } from '../state/orgStore.ts'

export function Navbar() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const organizations = useOrgStore((state) => state.organizations)
  const isLoggedIn = !!accessToken
  const hasActiveOrg = !!activeOrgId

  // Check if user has PRO/ENTERPRISE plan
  const hasPremiumPlan = organizations.some(
    (org) => org.plan === 'PRO' || org.plan === 'ENTERPRISE'
  )
  const shouldShowUpgrade = !hasPremiumPlan

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-900"></div>
          <span className="text-xl font-semibold text-slate-900">CoordGeo</span>
        </Link>
        <div className="flex items-center gap-3">
          {shouldShowUpgrade && (
            <Link
              to="/upgrade"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
            >
              ⭐ Plano PRO
            </Link>
          )}
          {isLoggedIn && hasActiveOrg ? (
            <Link
              to="/map"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ir para o mapa
            </Link>
          ) : isLoggedIn && !hasActiveOrg ? (
            <Link
              to="/select-org"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Selecionar organização
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
