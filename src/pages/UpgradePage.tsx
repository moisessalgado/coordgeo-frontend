import { Link } from 'react-router-dom'
import { useAuthStore } from '../state/authStore.ts'
import { useOrgStore } from '../state/orgStore.ts'

export function UpgradePage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const isLoggedIn = !!accessToken

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900"></div>
            <span className="text-xl font-semibold text-slate-900">CoordGeo</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn && activeOrgId ? (
              <Link
                to="/map"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Voltar ao mapa
              </Link>
            ) : (
              <Link
                to="/"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Voltar
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">
            Upgrade para o Plano
            <span className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PRO
            </span>
          </h1>
          <p className="text-lg text-slate-600">
            Desbloqueie recursos avançados e colaboração em equipe
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Plano FREE */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-8">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-slate-900">FREE</h3>
              <p className="mt-2 text-sm text-slate-600">Para uso pessoal</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">R$ 0</span>
              <span className="text-slate-600">/mês</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>1 organização pessoal</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Projetos ilimitados</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Layers e datasources ilimitados</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Suporte a GeoJSON, PMTiles, MVT</span>
              </li>
              <li className="flex items-start gap-2 opacity-50">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Sem colaboração em equipe</span>
              </li>
            </ul>
            <div className="mt-8">
              {isLoggedIn ? (
                <Link
                  to="/map"
                  className="block rounded-lg border-2 border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Plano atual
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="block rounded-lg border-2 border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Começar grátis
                </Link>
              )}
            </div>
          </div>

          {/* Plano PRO */}
          <div className="relative rounded-2xl border-2 border-blue-500 bg-white p-8 shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-semibold text-white">
              RECOMENDADO
            </div>
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-slate-900">PRO</h3>
              <p className="mt-2 text-sm text-slate-600">Para equipes e empresas</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">R$ 49</span>
              <span className="text-slate-600">/mês por organização</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">Organizações ilimitadas</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">Colaboração em equipe (Teams)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">Controle de permissões (RBAC)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Tudo do plano FREE</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Suporte prioritário</span>
              </li>
            </ul>
            <div className="mt-8">
              <button
                type="button"
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
              >
                Em breve
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">
                Pagamento e ativação de planos em desenvolvimento
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Precisa de mais?</h2>
          <p className="mb-6 text-slate-600">
            Entre em contato para planos Enterprise customizados para grandes equipes
          </p>
          <a
            href="mailto:contato@coordgeo.com"
            className="inline-flex rounded-lg border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Falar com vendas
          </a>
        </div>
      </section>
    </main>
  )
}
