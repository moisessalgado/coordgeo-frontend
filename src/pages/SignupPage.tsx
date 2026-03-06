import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { SignupForm } from '../components/Auth/SignupForm.tsx'
import { authService } from '../services/auth.ts'
import { getUserFacingApiError } from '../services/apiErrors.ts'
import { useAuthStore } from '../state/authStore.ts'

export function SignupPage() {
  const navigate = useNavigate()
  const loginAfterSignup = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      await authService.signup(email, password)
      
      // Fazer login automaticamente após signup
      await loginAfterSignup(email, password)
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
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto mt-20 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Criar conta</h1>
        <p className="mb-6 text-sm text-slate-600">
          Comece a usar o CoordGeo gratuitamente.
        </p>
        <SignupForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
        <div className="mt-6 space-y-3">
          <div className="text-center text-sm text-slate-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-slate-900 hover:underline">
              Fazer login
            </Link>
          </div>
          <div className="border-t border-slate-200 pt-3 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 hover:underline">
              ← Voltar à página inicial
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
