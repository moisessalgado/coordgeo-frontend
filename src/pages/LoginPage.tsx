import { useNavigate, Link } from 'react-router-dom'
import { LoginForm } from '../components/Auth/LoginForm.tsx'
import { Navbar } from '../components/Navbar.tsx'
import { Footer } from '../components/Footer.tsx'
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
  const isFreemium = useOrgStore((state) => state.isFreemium)
  const clearOrgSession = useOrgStore((state) => state.clearOrgSession)
  const resolveAndSetActiveOrg = useOrgStore((state) => state.resolveAndSetActiveOrg)

  const isLoggedIn = !!accessToken
  const shouldShowUpgrade = isLoggedIn && isFreemium

  const handleLogout = () => {
    logout()
    clearOrgSession()
  }

  const handleSubmit = async (email: string, password: string) => {
    clearError()
    clearOrgSession()
    try {
      await login(email, password)
      const resolvedOrgId = await resolveAndSetActiveOrg()

      if (resolvedOrgId) {
        navigate('/map', { replace: true })
        return
      }

      navigate('/select-org', { replace: true })
    } catch {
      return
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar />
      <main className="flex flex-1 flex-col justify-center p-6">
        <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/brand/coordgeo-mark.png"
            alt="Coordenada Geo"
            className="mb-4 h-20 w-20 object-contain"
          />
          <h1 className="mb-1 text-2xl font-semibold text-slate-900">Coordenada Geo</h1>
          <p className="text-sm text-slate-600">Acesse sua conta para continuar.</p>
        </div>
        
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
          {shouldShowUpgrade && (
            <div className="mt-4 text-center">
              <Link
                to="/upgrade"
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
              >
                <span>⭐</span>
                  <span>Aderir ao plano PRO</span>
              </Link>
            </div>
          )}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
