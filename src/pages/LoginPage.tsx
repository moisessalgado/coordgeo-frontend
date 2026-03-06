import { useNavigate, Link } from 'react-router-dom'
import { LoginForm } from '../components/Auth/LoginForm.tsx'
import { useAuthStore } from '../state/authStore.ts'
import { useOrgStore } from '../state/orgStore.ts'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const accessToken = useAuthStore((state) => state.accessToken)
  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const clearActiveOrg = useOrgStore((state) => state.clearActiveOrg)
  const organizations = useOrgStore((state) => state.organizations)

  const isLoggedIn = !!accessToken
  
  // Check if user has PRO/ENTERPRISE plan
  const hasPremiumPlan = organizations.some(
    (org) => org.plan === 'PRO' || org.plan === 'ENTERPRISE'
  )
  const shouldShowUpgrade = !hasPremiumPlan

  const handleLogout = () => {
    logout()
    clearActiveOrg()
  }

  const handleSubmit = async (email: string, password: string) => {
    clearError()
    try {
      await login(email, password)
      navigate('/select-org', { replace: true })
    } catch {
      return
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto mt-20 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">CoordGeo</h1>
        <p className="mb-6 text-sm text-slate-600">Acesse sua conta para continuar.</p>
        
        {isLoggedIn && (
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-800 mb-3">
              Você já está logado. Deseja continuar ou trocar de conta?
            </p>
            <div className="flex gap-2">
              {activeOrgId && (
                <button
                  type="button"
                  onClick={() => navigate('/map')}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Ir para o mapa
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Trocar conta
              </button>
            </div>
          </div>
        )}
        
        <LoginForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
        <div className="mt-6 space-y-3">
          <div className="text-center text-sm text-slate-600">
            Não tem uma conta?{' '}
            <Link to="/signup" className="font-medium text-slate-900 hover:underline">
              Criar conta
            </Link>
          </div>
          <div className="border-t border-slate-200 pt-3 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 hover:underline">
              ← Voltar à página inicial
            </Link>
          </div>
          {shouldShowUpgrade && (
            <div className="mt-4 text-center">
              <Link
                to="/upgrade"
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
              >
                <span>⭐</span>
                <span>Aderir ao Plano PRO</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
