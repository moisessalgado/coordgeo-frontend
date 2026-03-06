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

  const handleSubmit = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      clearOrgSession()
      await authService.signup(email, password)
      
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
              alt="CoordGeo"
              className="mb-4 h-20 w-20 object-contain"
            />
            <h1 className="mb-1 text-2xl font-semibold text-slate-900">Criar conta</h1>
            <p className="text-sm text-slate-600">
              Comece a usar o CoordGeo gratuitamente.
            </p>
          </div>
          <SignupForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
          <div className="mt-6 space-y-3">
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
