import type { Layer } from '../../types/geospatial.ts'

interface LayerToggleProps {
  layers: Layer[]
  isLayerVisible: (layerId: string) => boolean
  onToggle: (layerId: string) => void
}

export function LayerToggle({ layers, isLayerVisible, onToggle }: LayerToggleProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Camadas</h2>

      {layers.length === 0 ? <p className="text-sm text-slate-500">Sem camadas para exibir.</p> : null}

      <div className="space-y-2">
        {layers.map((layer) => {
          const visible = isLayerVisible(layer.id)
          return (
            <label key={layer.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-2">
              <span className="text-sm text-slate-800">{layer.name}</span>
              <input
                type="checkbox"
                checked={visible}
                onChange={() => onToggle(layer.id)}
              />
            </label>
          )
        })}
      </div>
    </section>
  )
}
