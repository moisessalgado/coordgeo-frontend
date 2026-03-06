import { useState } from 'react'
import type { GeoJsonGeometry } from '../../types/geospatial.ts'
import type { Project } from '../../types/geospatial.ts'
import { geodataService } from '../../services/geodata.ts'
import { getUserFacingApiError } from '../../services/apiErrors.ts'
import { useMapStore } from '../../state/mapStore.ts'
import * as turf from '@turf/turf'

interface CreateLayerModalProps {
  isOpen: boolean
  geometry: GeoJsonGeometry | null
  projects: Project[]
  onClose: () => void
  onSuccess?: () => void
}

export function CreateLayerModal({
  isOpen,
  geometry,
  projects,
  onClose,
  onSuccess,
}: CreateLayerModalProps) {
  const fetchMapData = useMapStore((state) => state.fetchMapData)
  const hasProjects = projects.length > 0

  // Generate suggested names based on existing data (must be before useState)
  const suggestedLayerName = `Layer ${useMapStore.getState().layers.length + 1}`
  const suggestedProjectName = `Project ${projects.length + 1}`

  const [name, setName] = useState(suggestedLayerName)
  const [description, setDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [projectName, setProjectName] = useState(suggestedProjectName)
  const [projectDescription, setProjectDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !geometry) return null

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
      if (!hasProjects) {
        // Create project and layer together
        await geodataService.createProjectAndLayer({
          projectName,
          projectDescription,
          layerName: name,
          layerDescription: description,
          geometry,
          style_config: {
            type: geometry.type.toLowerCase().replace('string', ''),
            paint: getDefaultPaint(geometry.type),
          },
        })
      } else {
        // Create datasource GeoJSON inline
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
          name: `${name} - Datasource`,
          description: `GeoJSON inline para ${name}`,
          datasource_type: 'vector',
          storage_url: `data:application/json,${encodeURIComponent(geojsonString)}`,
          metadata: { source: 'draw', created_at: new Date().toISOString() },
        })

        // Create layer vinculada ao datasource
        await geodataService.createLayer({
          name,
          description,
          project_id: selectedProjectId,
          datasource_id: datasource.id,
          style_config: {
            type: geometry.type.toLowerCase().replace('string', ''),
            paint: getDefaultPaint(geometry.type),
          },
          metadata: { drawn: true, geometryType: geometry.type },
        })
      }

      // Refresh map data
      await fetchMapData()

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(
        getUserFacingApiError(err, {
          context: 'map',
          fallbackMessage: 'Não foi possível salvar a layer. Tente novamente.',
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultPaint = (geometryType: string) => {
    if (geometryType.includes('Polygon')) {
      return {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.4,
        'fill-outline-color': '#1e40af',
      }
    }
    if (geometryType.includes('LineString')) {
      return {
        'line-color': '#3b82f6',
        'line-width': 3,
      }
    }
    if (geometryType.includes('Point')) {
      return {
        'circle-radius': 8,
        'circle-color': '#3b82f6',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#1e40af',
      }
    }
    return {}
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
        <h2 className="mb-1 text-xl font-semibold text-slate-900">Salvar layer desenhada</h2>
        <p className="mb-4 text-sm text-slate-600">
          {geometry.type} • {geometryInfo}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="layer-name" className="block text-sm font-medium text-slate-700">
              Nome da layer
            </label>
            <input
              id="layer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="layer-description" className="block text-sm font-medium text-slate-700">
              Descrição
            </label>
            <textarea
              id="layer-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
              placeholder="Descreva a layer..."
            />
          </div>

          {hasProjects ? (
            <div className="space-y-2">
              <label htmlFor="layer-project" className="block text-sm font-medium text-slate-700">
                Projeto
              </label>
              <select
                id="layer-project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
              >
                <option value="">Selecione um projeto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                Você não tem nenhum projeto. Crie um novo para esta layer.
              </div>
              <div className="space-y-2">
                <label htmlFor="project-name" className="block text-sm font-medium text-slate-700">
                  Nome do projeto
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="project-description" className="block text-sm font-medium text-slate-700">
                  Descrição do projeto
                </label>
                <textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={isLoading}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                  placeholder="Descrição do projeto (opcional)"
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
              disabled={
                isLoading ||
                (!hasProjects ? !projectName : !selectedProjectId)
              }
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar layer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
