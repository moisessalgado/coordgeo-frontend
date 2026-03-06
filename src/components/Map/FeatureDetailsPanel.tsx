import type { Layer, Datasource } from '../../types/geospatial.ts'

interface FeatureDetailsPanelProps {
  layer: Layer | null
  datasource: Datasource | null
  onClose: () => void
}

export function FeatureDetailsPanel({
  layer,
  datasource,
  onClose,
}: FeatureDetailsPanelProps) {
  if (!layer || !datasource) return null

  return (
    <div className="absolute bottom-4 left-4 max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{layer.name}</h3>
          {layer.description && (
            <p className="text-sm text-slate-600">{layer.description}</p>
          )}
          
          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Datasource
              </p>
              <p className="text-sm text-slate-800">{datasource.name}</p>
            </div>

            {datasource.description && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Descrição
                </p>
                <p className="text-sm text-slate-800">{datasource.description}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Tipo
              </p>
              <p className="text-sm text-slate-800">{datasource.datasource_type}</p>
            </div>

            {Object.keys(layer.metadata).length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Metadados
                </p>
                <pre className="overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
                  {JSON.stringify(layer.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 rounded px-2 py-1 text-slate-500 hover:bg-slate-100"
          title="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
