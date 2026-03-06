import { useNavigate, Link } from 'react-router-dom'
import { LoginForm } from '../components/Auth/LoginForm.tsx'
import { useAuthStore } from '../state/authStore.ts'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

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
        <LoginForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
        <div className="mt-4 text-center text-sm text-slate-600">
          Não tem uma conta?{' '}
          <Link to="/signup" className="font-medium text-slate-900 hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  )
}
