interface DrawControlsProps {
  onDrawPoint: () => void
  onDrawLineString: () => void
  onDrawPolygon: () => void
  onCancelDraw: () => void
  isDrawing: boolean
}

export function DrawControls({
  onDrawPoint,
  onDrawLineString,
  onDrawPolygon,
  onCancelDraw,
  isDrawing,
}: DrawControlsProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-lg">
      {isDrawing ? (
        <button
          onClick={onCancelDraw}
          className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          title="Cancelar desenho"
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
        </>
      )}
    </div>
  )
}
