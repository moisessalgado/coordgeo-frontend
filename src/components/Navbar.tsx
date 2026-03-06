import { Link, useLocation } from 'react-router-dom'
import { UserAccountMenu } from './Auth/UserAccountMenu.tsx'
import { useAuthStore } from '../state/authStore.ts'
import { useOrgStore } from '../state/orgStore.ts'

export function Navbar() {
  const location = useLocation()
  const accessToken = useAuthStore((state) => state.accessToken)
  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const isLoggedIn = !!accessToken
  const hasActiveOrg = !!activeOrgId
  const isMapPage = location.pathname === '/map'

  return (
    <nav className="relative z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/brand/coordgeo-mark.png"
            alt="CoordGeo"
            className="h-12 w-12 object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Coordenada Geo
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            hasActiveOrg ? (
              !isMapPage ? (
                <Link
                  to="/map"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Ir para o mapa
                </Link>
              ) : null
            ) : (
              <Link
                to="/select-org"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Selecionar organização
              </Link>
            )
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
          <UserAccountMenu />
        </div>
      </div>
    </nav>
  )
}
