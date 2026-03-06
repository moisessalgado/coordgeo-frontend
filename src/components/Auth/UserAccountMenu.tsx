import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore.ts'
import { useOrgStore } from '../../state/orgStore.ts'

export function UserAccountMenu() {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const accessToken = useAuthStore((state) => state.accessToken)
  const userProfile = useAuthStore((state) => state.userProfile)
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser)
  const logout = useAuthStore((state) => state.logout)
  const clearOrgSession = useOrgStore((state) => state.clearOrgSession)
  const organizations = useOrgStore((state) => state.organizations)

  const hasPremiumPlan = organizations.some(
    (org) => org.plan === 'pro' || org.plan === 'enterprise'
  )

  const currentPlan = organizations.some((org) => org.plan === 'enterprise')
    ? 'enterprise'
    : organizations.some((org) => org.plan === 'pro')
      ? 'pro'
      : 'free'

  const currentPlanLabel = currentPlan === 'enterprise'
    ? 'Enterprise'
    : currentPlan === 'pro'
      ? 'PRO'
      : 'Freemium'

  useEffect(() => {
    if (!accessToken || userProfile) {
      return
    }

    void fetchCurrentUser()
  }, [accessToken, userProfile, fetchCurrentUser])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!accessToken) {
    return null
  }

  const handleLogoutToLanding = () => {
    setIsOpen(false)
    logout()
    clearOrgSession()
    navigate('/', { replace: true })
  }

  const handleSwitchAccount = () => {
    setIsOpen(false)
    logout()
    clearOrgSession()
    navigate('/login', { replace: true })
  }

  const handleSwitchOrganization = () => {
    setIsOpen(false)
    navigate('/select-org')
  }

  const handleOpenSettings = () => {
    setIsOpen(false)
    navigate('/settings')
  }

  const displayName = userProfile?.display_name || userProfile?.username || 'Conta ativa'
  const displayEmail = userProfile?.email || 'usuario@coordgeo'

  return (
    <div ref={containerRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="truncate text-xs text-slate-500">{displayEmail}</p>
        </div>
        <svg
          className={`h-4 w-4 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="mt-1 text-xs text-slate-500">{displayEmail}</p>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Plano</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  currentPlan === 'enterprise'
                    ? 'bg-slate-900 text-white'
                    : currentPlan === 'pro'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                }`}
              >
                {currentPlanLabel}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {!hasPremiumPlan && location.pathname !== '/upgrade' ? (
              <Link
                to="/upgrade"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
              >
                <span>Aderir ao Plano PRO</span>
                <span>→</span>
              </Link>
            ) : null}

            <button
              type="button"
              onClick={handleSwitchOrganization}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>Trocar organização</span>
              <span>→</span>
            </button>

            {location.pathname !== '/settings' ? (
              <button
                type="button"
                onClick={handleOpenSettings}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span>Configurações</span>
                <span>→</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSwitchAccount}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>Trocar de conta</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={handleLogoutToLanding}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>Sair</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}