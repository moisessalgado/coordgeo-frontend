import { useState, useEffect } from 'react'
import type { GeoJsonGeometry, Layer, Datasource } from '../../types/geospatial.ts'
import { geodataService } from '../../services/geodata.ts'
import { getUserFacingApiError } from '../../services/apiErrors.ts'
import { useMapStore } from '../../state/mapStore.ts'
import * as turf from '@turf/turf'

interface EditLayerModalProps {
  isOpen: boolean
  layers: Layer[]
  datasources: Datasource[]
  geometry: GeoJsonGeometry | null
  onClose: () => void
  onSuccess?: () => void
}

export function EditLayerModal({
  isOpen,
  layers,
  datasources,
  geometry,
  onClose,
  onSuccess,
}: EditLayerModalProps) {
  const [selectedLayerId, setSelectedLayerId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchMapData = useMapStore((state) => state.fetchMapData)

  // Reset form when opening modal
  useEffect(() => {
    if (isOpen) {
      setSelectedLayerId('')
      setName('')
      setDescription('')
      setError(null)
    }
  }, [isOpen])

  // Update name and description when layer is selected
  useEffect(() => {
    if (selectedLayerId) {
      const layer = layers.find((l) => l.id === selectedLayerId)
      if (layer) {
        setName(layer.name)
        setDescription(layer.description)
      }
    }
  }, [selectedLayerId, layers])

  if (!isOpen || !geometry) return null

  // Filtrar apenas layers que foram desenhadas (tem datasource inline GeoJSON)
  const editableLayers = layers.filter((layer) => {
    const datasource = datasources.find((ds) => ds.id === layer.datasource_id)
    return datasource?.storage_url.startsWith('data:application/json')
  })

  // Calcular informações da geometria com Turf.js
  const getGeometryInfo = () => {
    if (!geometry) return null

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const feature = turf.feature(geometry as any)
      
      if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        const area = turf.area(feature)
        return `Área: ${(area / 1000000).toFixed(2)} km²`
      }
      
      if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
        const length = turf.length(feature, { units: 'kilometers' })
        return `Comprimento: ${length.toFixed(2)} km`
      }
      
      if (geometry.type === 'Point' || geometry.type === 'MultiPoint') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coords = (geometry as any).coordinates
        return `Coordenadas: [${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]`
      }
    } catch {
      return null
    }

    return null
  }

  const geometryInfo = getGeometryInfo()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const selectedLayer = layers.find((l) => l.id === selectedLayerId)
      if (!selectedLayer) {
        throw new Error('Layer não encontrada')
      }

      // Criar novo datasource com geometria atualizada
      const geojsonString = JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry,
            properties: {},
          },
        ],
      })

      const datasource = await geodataService.createDatasource({
        name: `${name} - Datasource (atualizado)`,
        description: `GeoJSON inline para ${name}`,
        datasource_type: 'vector',
        storage_url: `data:application/json,${encodeURIComponent(geojsonString)}`,
        metadata: { 
          source: 'draw', 
          updated_at: new Date().toISOString(),
          previous_datasource_id: selectedLayer.datasource_id,
        },
      })

      // Atualizar layer com novo datasource
      await geodataService.updateLayer(selectedLayerId, {
        name,
        description,
        datasource_id: datasource.id,
        style_config: {
          ...selectedLayer.style_config,
          type: geometry.type.toLowerCase().replace('string', ''),
        },
        metadata: {
          ...selectedLayer.metadata,
          geometryType: geometry.type,
          edited: true,
          last_edit: new Date().toISOString(),
        },
      })

      // Refresh map data
      await fetchMapData()

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(
        getUserFacingApiError(err, {
          context: 'map',
          fallbackMessage: 'Não foi possível atualizar a layer. Tente novamente.',
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

  if (editableLayers.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Nenhuma layer editável</h2>
          <p className="mb-4 text-sm text-slate-600">
            Você não tem layers desenhadas para editar. Desenhe uma nova layer primeiro.
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="mb-1 text-xl font-semibold text-slate-900">Editar layer</h2>
        <p className="mb-4 text-sm text-slate-600">
          {geometry.type} • {geometryInfo}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-layer-select" className="block text-sm font-medium text-slate-700">
              Selecione a layer para editar
            </label>
            <select
              id="edit-layer-select"
              value={selectedLayerId}
              onChange={(e) => setSelectedLayerId(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
            >
              <option value="">Escolha uma layer...</option>
              {editableLayers.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </div>

          {selectedLayerId && (
            <>
              <div className="space-y-2">
                <label htmlFor="edit-layer-name" className="block text-sm font-medium text-slate-700">
                  Nome da layer
                </label>
                <input
                  id="edit-layer-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                  placeholder="Ex: Área de estudo"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-layer-description" className="block text-sm font-medium text-slate-700">
                  Descrição
                </label>
                <textarea
                  id="edit-layer-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isLoading}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                  placeholder="Descreva a layer..."
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedLayerId}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Atualizar layer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
