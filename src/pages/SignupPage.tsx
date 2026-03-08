import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { SignupForm } from '../components/Auth/SignupForm.tsx'
import { Navbar } from '../components/Navbar.tsx'
import { Footer } from '../components/Footer.tsx'
import { authService } from '../services/auth.ts'
import { getUserFacingApiError } from '../services/apiErrors.ts'
import { useAuthStore } from '../state/authStore.ts'
import { useOrgStore } from '../state/orgStore.ts'

export function SignupPage() {
  const navigate = useNavigate()
  const loginAfterSignup = useAuthStore((state) => state.login)
  const clearOrgSession = useOrgStore((state) => state.clearOrgSession)
  const resolveAndSetActiveOrg = useOrgStore((state) => state.resolveAndSetActiveOrg)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free')

  const handleSubmit = async (email: string, password: string, plan: 'free' | 'pro') => {
    setError(null)
    setIsLoading(true)
    setSelectedPlan(plan)

    try {
      clearOrgSession()
      await authService.signup(email, password, plan)
      
      // Fazer login automaticamente após signup
      await loginAfterSignup(email, password)

      const resolvedOrgId = await resolveAndSetActiveOrg()
      if (resolvedOrgId) {
        navigate('/map', { replace: true })
        return
      }

      navigate('/select-org', { replace: true })
    } catch (err) {
      setError(
        getUserFacingApiError(err, {
          context: 'auth',
          fallbackMessage: 'Não foi possível criar a conta. Tente novamente.',
        }),
      )
    } finally {
      setIsLoading(false)
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
            <h1 className="mb-1 text-2xl font-semibold text-slate-900">Criar conta</h1>
            <p className="text-sm text-slate-600">
              Escolha seu plano e comece a usar o Coordenada Geo.
            </p>
          </div>
          <SignupForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
          <div className="mt-6 space-y-3">
            {selectedPlan === 'free' && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                <p className="text-sm text-blue-900">No FREE, você pode aderir ao PRO quando quiser.</p>
                <Link
                  to="/upgrade"
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
                >
                  <span>⭐</span>
                  <span>Aderir ao plano PRO</span>
                </Link>
              </div>
            )}
            <div className="text-center text-sm text-slate-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-slate-900 hover:underline">
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default SignupPage
