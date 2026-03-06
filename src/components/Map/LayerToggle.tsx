import { useState } from 'react'
import type { Layer } from '../../types/geospatial.ts'

interface LayerToggleProps {
  layers: Layer[]
  isLayerVisible: (layerId: string) => boolean
  onToggle: (layerId: string) => void
  onDelete: (layer: Layer) => void
  onEdit: (layerId: string, name: string, description: string) => Promise<void>
  onMoveUp: (layerId: string) => Promise<void>
  onMoveDown: (layerId: string) => Promise<void>
  onOpacityChange: (layerId: string, opacity: number) => Promise<void>
  isBusy?: (key: string) => boolean
}

const getLayerOpacity = (layer: Layer) => {
  const style = layer.style_config ?? {}
  const paint = (style.paint as Record<string, unknown> | undefined) ?? {}

  const type = typeof style.type === 'string' ? style.type : ''
  const keys = type === 'line'
    ? ['line-opacity']
    : type === 'circle'
      ? ['circle-opacity']
      : ['fill-opacity', 'line-opacity', 'circle-opacity']

  for (const key of keys) {
    const value = paint[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.round(value * 100)
    }
  }

  return 100
}

export function LayerToggle({
  layers,
  isLayerVisible,
  onToggle,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  onOpacityChange,
  isBusy,
}: LayerToggleProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [opacityDrafts, setOpacityDrafts] = useState<Record<string, number>>({})

  const startEdit = (layer: Layer) => {
    setEditingLayerId(layer.id)
    setEditingName(layer.name)
    setEditingDescription(layer.description)
  }

  const cancelEdit = () => {
    setEditingLayerId(null)
    setEditingName('')
    setEditingDescription('')
  }

  const saveEdit = async () => {
    if (!editingLayerId || !editingName.trim()) {
      return
    }

    await onEdit(editingLayerId, editingName, editingDescription)
    cancelEdit()
  }

  const commitOpacity = async (layerId: string) => {
    const draft = opacityDrafts[layerId]
    if (draft === undefined) {
      return
    }

    await onOpacityChange(layerId, draft)
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Camadas</h2>

      {layers.length === 0 ? <p className="text-sm text-slate-500">Sem camadas para exibir.</p> : null}

      <div className="space-y-2">
        {layers.map((layer, index) => {
          const visible = isLayerVisible(layer.id)
          const isEditing = editingLayerId === layer.id
          const isFirst = index === 0
          const isLast = index === layers.length - 1
          const opacityValue = opacityDrafts[layer.id] ?? getLayerOpacity(layer)
          const projectActionBusy = isBusy?.(`layer-edit-${layer.id}`) ?? false
          const deleteBusy = isBusy?.(`layer-delete-${layer.id}`) ?? false
          const moveUpBusy = isBusy?.(`layer-move-up-${layer.id}`) ?? false
          const moveDownBusy = isBusy?.(`layer-move-down-${layer.id}`) ?? false
          const opacityBusy = isBusy?.(`layer-opacity-${layer.id}`) ?? false

          return (
            <div key={layer.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-2">
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
                    <p className="text-xs text-slate-400">z-index {layer.z_index}</p>
                </div>
              </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      void onMoveUp(layer.id)
                    }}
                    disabled={isFirst || moveUpBusy}
                    className="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void onMoveDown(layer.id)
                    }}
                    disabled={isLast || moveDownBusy}
                    className="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(layer)}
                    className="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    title={`Editar ${layer.name}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(layer)}
                    disabled={deleteBusy}
                    className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title={`Deletar ${layer.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2 rounded-lg bg-slate-50 p-2">
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-500"
                    placeholder="Nome da camada"
                  />
                  <textarea
                    value={editingDescription}
                    onChange={(event) => setEditingDescription(event.target.value)}
                    rows={2}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-500"
                    placeholder="Descrição"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void saveEdit()
                      }}
                      disabled={projectActionBusy || !editingName.trim()}
                      className="rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {projectActionBusy ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Transparência</span>
                  <span className="text-xs text-slate-500">{opacityValue}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={opacityValue}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value)
                    setOpacityDrafts((current) => ({ ...current, [layer.id]: nextValue }))
                  }}
                  onMouseUp={() => {
                    void commitOpacity(layer.id)
                  }}
                  onTouchEnd={() => {
                    void commitOpacity(layer.id)
                  }}
                  onKeyUp={(event) => {
                    if (event.key === 'Enter') {
                      void commitOpacity(layer.id)
                    }
                  }}
                  disabled={opacityBusy}
                  className="w-full"
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
