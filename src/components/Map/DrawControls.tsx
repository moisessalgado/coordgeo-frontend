import { ActionButton } from '../UI/ActionButton.tsx'

interface DrawControlsProps {
  onDrawPoint: () => void
  onDrawLineString: () => void
  onDrawPolygon: () => void
  onEditLayer: () => void
  onCancelDraw: () => void
  isDrawing: boolean
  isEditing: boolean
  hasEditableLayers: boolean
  className?: string
}

export function DrawControls({
  onDrawPoint,
  onDrawLineString,
  onDrawPolygon,
  onEditLayer,
  onCancelDraw,
  isDrawing,
  isEditing,
  hasEditableLayers,
  className,
}: DrawControlsProps) {
  const containerClasses = className ?? 'grid grid-cols-4 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2'

  return (
    <div className={containerClasses}>
      {isDrawing || isEditing ? (
        <ActionButton
          label="Cancelar desenho"
          icon="✕"
          variant="danger"
          compact
          className="col-span-4 min-h-8 min-w-8 px-0 text-base"
          onClick={onCancelDraw}
        />
      ) : (
        <>
          <ActionButton
            label="Desenhar ponto"
            icon="📍"
            variant="primary"
            compact
            className="min-h-8 min-w-8 px-0 text-base"
            onClick={onDrawPoint}
          />
          <ActionButton
            label="Desenhar linha"
            icon="📏"
            variant="primary"
            compact
            className="min-h-8 min-w-8 px-0 text-base"
            onClick={onDrawLineString}
          />
          <ActionButton
            label="Desenhar polígono"
            icon="⬟"
            variant="primary"
            compact
            className="min-h-8 min-w-8 px-0 text-base"
            onClick={onDrawPolygon}
          />
          <ActionButton
            label="Editar camada"
            icon="✏️"
            variant="secondary"
            compact
            className="min-h-8 min-w-8 px-0 text-base"
            onClick={onEditLayer}
            disabled={!hasEditableLayers}
          />
        </>
      )}
    </div>
  )
}
