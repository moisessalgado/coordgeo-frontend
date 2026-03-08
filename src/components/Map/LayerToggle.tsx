import { useState } from 'react'
import type { Layer } from '../../types/geospatial.ts'
import { ActionButton } from '../UI/ActionButton.tsx'
import { SectionHeader } from '../UI/SectionHeader.tsx'

interface LayerToggleProps {
  layers: Layer[]
  isLayerVisible: (layerId: string) => boolean
  onToggle: (layerId: string) => void
  onDelete: (layer: Layer) => void
  onEdit: (layerId: string, name: string, description: string) => Promise<void>
  onReorder: (sourceLayerId: string, targetLayerId: string) => Promise<void>
  onOpacityChange: (layerId: string, opacity: number) => Promise<void>
  onColorChange: (layerId: string, color: string) => Promise<void>
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

const getLayerColor = (layer: Layer) => {
  const style = layer.style_config ?? {}
  const paint = (style.paint as Record<string, unknown> | undefined) ?? {}

  const type = typeof style.type === 'string' ? style.type : ''
  const keys = type === 'line'
    ? ['line-color']
    : type === 'circle'
      ? ['circle-color']
      : ['fill-color', 'line-color', 'circle-color']

  for (const key of keys) {
    const value = paint[key]
    if (typeof value === 'string') {
      return value
    }
  }

  return '#2563eb'
}

export function LayerToggle({
  layers,
  isLayerVisible,
  onToggle,
  onDelete,
  onEdit,
  onReorder,
  onOpacityChange,
  onColorChange,
  isBusy,
}: LayerToggleProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [opacityDrafts, setOpacityDrafts] = useState<Record<string, number>>({})
  const [colorDrafts, setColorDrafts] = useState<Record<string, string>>({})
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null)
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null)

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

  const commitColor = async (layerId: string) => {
    const draft = colorDrafts[layerId]
    if (!draft) {
      return
    }

    await onColorChange(layerId, draft)
  }

  const handleDrop = async (targetLayerId: string) => {
    if (!draggingLayerId || draggingLayerId === targetLayerId) {
      setDragOverLayerId(null)
      return
    }

    await onReorder(draggingLayerId, targetLayerId)
    setDraggingLayerId(null)
    setDragOverLayerId(null)
  }

  return (
    <section className="sidebar-card space-y-2">
      <SectionHeader title="Camadas" subtitle="Visibilidade, ordem e estilo" />

      {layers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">Sem camadas para exibir.</p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        {layers.map((layer) => {
          const visible = isLayerVisible(layer.id)
          const isEditing = editingLayerId === layer.id
          const opacityValue = opacityDrafts[layer.id] ?? getLayerOpacity(layer)
          const colorValue = colorDrafts[layer.id] ?? getLayerColor(layer)
          const projectActionBusy = isBusy?.(`layer-edit-${layer.id}`) ?? false
          const deleteBusy = isBusy?.(`layer-delete-${layer.id}`) ?? false
          const reorderBusy = isBusy?.(`layer-reorder-${layer.id}`) ?? false
          const opacityBusy = isBusy?.(`layer-opacity-${layer.id}`) ?? false
          const colorBusy = isBusy?.(`layer-color-${layer.id}`) ?? false
          const isDropTarget = dragOverLayerId === layer.id && draggingLayerId !== layer.id

          return (
            <article
              key={layer.id}
              draggable
              onDragStart={(event) => {
                setDraggingLayerId(layer.id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', layer.id)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                setDragOverLayerId(layer.id)
              }}
              onDragLeave={() => {
                setDragOverLayerId((current) => (current === layer.id ? null : current))
              }}
              onDrop={(event) => {
                event.preventDefault()
                void handleDrop(layer.id)
              }}
              onDragEnd={() => {
                setDraggingLayerId(null)
                setDragOverLayerId(null)
              }}
              className={`space-y-1.5 rounded-lg border bg-white p-2.5 transition hover:border-slate-300 ${isDropTarget ? 'border-slate-400 ring-1 ring-slate-200' : 'border-slate-200'} ${draggingLayerId === layer.id ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <label className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className="cursor-grab select-none text-slate-400 active:cursor-grabbing"
                  aria-hidden="true"
                  title="Arraste para reordenar"
                >
                  ⋮⋮
                </span>
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => onToggle(layer.id)}
                  className="focus-ui h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900"
                  aria-label={`Alternar visibilidade da camada ${layer.name}`}
                />
                <div className="min-w-0 flex-1" title={layer.description || layer.name}>
                    <p className="truncate text-sm font-semibold text-slate-900">{layer.name}</p>
                    <p className="truncate text-[11px] text-slate-500">z-index {layer.z_index}</p>
                </div>
              </label>

                <div className="flex items-center gap-0.5">
                  <ActionButton
                    label={`Editar ${layer.name}`}
                    icon="✏️"
                    variant="subtle"
                    compact
                    className="min-h-8 min-w-8 px-0"
                    onClick={() => startEdit(layer)}
                    disabled={reorderBusy}
                  />
                  <ActionButton
                    label={`Deletar ${layer.name}`}
                    icon="🗑️"
                    variant="subtle"
                    compact
                    className="min-h-8 min-w-8 px-0 text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(layer)}
                    disabled={deleteBusy || reorderBusy}
                  />
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="input-ui"
                    placeholder="Nome da camada"
                  />
                  <textarea
                    value={editingDescription}
                    onChange={(event) => setEditingDescription(event.target.value)}
                    rows={1}
                    className="input-ui min-h-12 resize-y"
                    placeholder="Descrição"
                  />
                  <div className="flex justify-end gap-2">
                    <ActionButton label="Cancelar edição" variant="secondary" onClick={cancelEdit} />
                    <ActionButton
                      label={projectActionBusy ? 'Salvando...' : 'Salvar'}
                      variant="primary"
                      onClick={() => {
                        void saveEdit()
                      }}
                      disabled={projectActionBusy || !editingName.trim()}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                <input
                  type="color"
                  value={colorValue}
                  onChange={(event) => {
                    const nextColor = event.target.value
                    setColorDrafts((current) => ({ ...current, [layer.id]: nextColor }))
                  }}
                  onBlur={() => {
                    void commitColor(layer.id)
                  }}
                  disabled={colorBusy}
                  className="focus-ui h-7 w-9 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
                  aria-label={`Selecionar cor da camada ${layer.name}`}
                />
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
                  disabled={opacityBusy || colorBusy}
                  className="range-ui"
                  aria-label={`Ajustar transparência da camada ${layer.name}`}
                />
                <span className="w-10 text-right text-[11px] font-medium text-slate-600">
                  {colorBusy ? '...' : `${opacityValue}%`}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
