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

  const primaryAction = isLoggedIn
    ? hasActiveOrg
      ? !isMapPage
        ? (
            <Link
              to="/map"
              className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ir para o mapa
            </Link>
          )
        : null
      : (
          <Link
            to="/select-org"
            className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Selecionar organização
          </Link>
        )
    : null

  return (
    <nav className="relative z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/brand/coordgeo-mark.png"
            alt="Coordenada Geo"
            className="h-12 w-12 object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Coordenada Geo
          </span>
        </Link>
        <div className="flex min-w-[320px] items-center justify-end gap-3">
          {isLoggedIn ? <div className="flex w-[210px] justify-end">{primaryAction}</div> : null}
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Criar conta
              </Link>
            </>
          ) : null}
          <UserAccountMenu />
        </div>
      </div>
    </nav>
  )
}
