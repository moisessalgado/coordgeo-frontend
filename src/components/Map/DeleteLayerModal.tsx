import { useState } from 'react'
import type { Layer } from '../../types/geospatial.ts'
import { geodataService } from '../../services/geodata.ts'
import { getUserFacingApiError } from '../../services/apiErrors.ts'
import { useMapStore } from '../../state/mapStore.ts'

interface DeleteLayerModalProps {
  isOpen: boolean
  layer: Layer | null
  onClose: () => void
  onSuccess?: () => void
}

export function DeleteLayerModal({
  isOpen,
  layer,
  onClose,
  onSuccess,
}: DeleteLayerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchMapData = useMapStore((state) => state.fetchMapData)

  if (!isOpen || !layer) return null

  const handleConfirmDelete = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await geodataService.deleteLayer(layer.id)
      
      // Refresh map data
      await fetchMapData()

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(
        getUserFacingApiError(err, {
          context: 'map',
          fallbackMessage: 'Não foi possível deletar a layer. Tente novamente.',
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isLoading) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-xl font-semibold text-slate-900">Deletar layer?</h2>
        <p className="mb-4 text-sm text-slate-600">
          Tem certeza que deseja deletar a layer <strong>{layer.name}</strong>? Esta ação não pode ser desfeita.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Deletando...' : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  )
}
