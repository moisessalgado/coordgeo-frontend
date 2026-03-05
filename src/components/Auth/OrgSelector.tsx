import type { Organization } from '../../types/organization.ts'

interface OrgSelectorProps {
  organizations: Organization[]
  activeOrgId: string | null
  isLoading: boolean
  error: string | null
  onSelect: (orgId: string) => void
  onContinue: () => void
  onReload: () => Promise<void>
}

export function OrgSelector({
  organizations,
  activeOrgId,
  isLoading,
  error,
  onSelect,
  onContinue,
  onReload,
}: OrgSelectorProps) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Selecione a organização</h2>
        <button
          type="button"
          onClick={() => {
            void onReload()
          }}
          className="text-sm font-medium text-slate-700 underline"
        >
          Recarregar
        </button>
      </div>

      {isLoading ? <p className="text-sm text-slate-600">Carregando organizações...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!isLoading && organizations.length === 0 ? (
        <p className="text-sm text-slate-600">Nenhuma organização disponível para este usuário.</p>
      ) : null}

      <div className="space-y-2">
        {organizations.map((organization) => {
          const checked = organization.id === activeOrgId
          return (
            <label
              key={organization.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3"
            >
              <input
                type="radio"
                name="organization"
                checked={checked}
                onChange={() => onSelect(organization.id)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">{organization.name}</p>
                <p className="text-xs text-slate-600">{organization.slug}</p>
              </div>
            </label>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!activeOrgId}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Continuar para o mapa
      </button>
    </section>
  )
}
