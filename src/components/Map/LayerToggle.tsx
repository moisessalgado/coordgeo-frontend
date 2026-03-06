import type { Layer } from '../../types/geospatial.ts'

interface LayerToggleProps {
  layers: Layer[]
  isLayerVisible: (layerId: string) => boolean
  onToggle: (layerId: string) => void
  onDelete: (layer: Layer) => void
}

export function LayerToggle({ layers, isLayerVisible, onToggle, onDelete }: LayerToggleProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Camadas</h2>

      {layers.length === 0 ? <p className="text-sm text-slate-500">Sem camadas para exibir.</p> : null}

      <div className="space-y-2">
        {layers.map((layer) => {
          const visible = isLayerVisible(layer.id)
          return (
            <div key={layer.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2">
              <label className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => onToggle(layer.id)}
                  className="cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{layer.name}</p>
                  {layer.description && (
                    <p className="text-xs text-slate-500 truncate">{layer.description}</p>
                  )}
                </div>
              </label>
              <button
                onClick={() => onDelete(layer)}
                className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                title={`Deletar ${layer.name}`}
              >
                🗑️
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
