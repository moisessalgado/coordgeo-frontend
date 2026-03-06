import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { Navbar } from '../components/Navbar.tsx'
import { Footer } from '../components/Footer.tsx'
import { useAuthStore } from '../state/authStore.ts'
import { useOrgStore } from '../state/orgStore.ts'
import { upgradeOrganizationPlan } from '../services/organizations.ts'

export function UpgradePage() {
  const navigate = useNavigate()
  const accessToken = useAuthStore((state) => state.accessToken)
  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const organizations = useOrgStore((state) => state.organizations)
  const fetchUserOrganizations = useOrgStore((state) => state.fetchUserOrganizations)
  
  const isLoggedIn = !!accessToken
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  const handleUpgradeClick = () => {
    if (!isLoggedIn) {
      navigate('/signup')
      return
    }
    setIsUpgradeModalOpen(true)
    setUpgradeError(null)
  }

  const handleConfirmUpgrade = async () => {
    if (!activeOrgId) {
      setUpgradeError('Nenhuma organização selecionada')
      return
    }

    setIsUpgrading(true)
    setUpgradeError(null)

    try {
      await upgradeOrganizationPlan(activeOrgId, 'pro')
      // Refresh organizations data to update frontend state
      await fetchUserOrganizations()
      setIsUpgradeModalOpen(false)
      navigate('/map', { replace: true })
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ detail?: string }>
      const detail = axiosError.response?.data?.detail
      const message = error instanceof Error ? error.message : null
      setUpgradeError(detail || message || 'Erro ao fazer upgrade do plano')
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <main className="flex-1">
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
                onClick={handleUpgradeClick}
                disabled={isUpgradeModalOpen && isUpgrading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggedIn ? 'Aderir ao Plano PRO' : 'Começar com Plano PRO'}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">
                R$ 49/mês para organizações ilimitadas
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

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              Aderir ao Plano PRO
            </h2>
            <p className="mb-6 text-slate-600">
              Você está prestes a fazer upgrade da sua organização para o plano PRO
            </p>

            {upgradeError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {upgradeError}
              </div>
            )}

            <div className="mb-6 space-y-2 rounded-lg bg-slate-50 p-4">
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Preço:</p>
                <p className="mt-1">R$ 49 por mês</p>
              </div>
              <div className="border-t border-slate-200 pt-2 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Organização:</p>
                <p className="mt-1">
                  {organizations.find((org) => org.id === activeOrgId)?.name || 'Carregando...'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                disabled={isUpgrading}
                className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                disabled={isUpgrading}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpgrading ? 'Processando...' : 'Confirmar Upgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
      <Footer />
    </div>
  )
}
