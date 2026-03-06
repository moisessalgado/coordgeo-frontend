interface DrawControlsProps {
  onDrawPoint: () => void
  onDrawLineString: () => void
  onDrawPolygon: () => void
  onEditLayer: () => void
  onCancelDraw: () => void
  isDrawing: boolean
  isEditing: boolean
  hasEditableLayers: boolean
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
}: DrawControlsProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-lg">
      {isDrawing || isEditing ? (
        <button
          onClick={onCancelDraw}
          className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          title="Cancelar"
        >
          ✕ Cancelar
        </button>
      ) : (
        <>
          <button
            onClick={onDrawPoint}
            className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            title="Desenhar ponto"
          >
            📍 Ponto
          </button>
          <button
            onClick={onDrawLineString}
            className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            title="Desenhar linha"
          >
            📏 Linha
          </button>
          <button
            onClick={onDrawPolygon}
            className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            title="Desenhar polígono"
          >
            ⬟ Polígono
          </button>
          <button
            onClick={onEditLayer}
            disabled={!hasEditableLayers}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            title={hasEditableLayers ? 'Editar layer existente' : 'Nenhuma layer editável disponível'}
          >
            ✏️ Editar
          </button>
        </>
      )}
    </div>
  )
}
