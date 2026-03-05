import { create } from 'zustand'
import { geodataService } from '../services/geodata.ts'
import { getUserFacingApiError } from '../services/apiErrors.ts'
import type { Datasource, Layer, Project } from '../types/geospatial.ts'

interface MapState {
  projects: Project[]
  layers: Layer[]
  datasources: Datasource[]
  hiddenLayerIds: Set<string>
  isLoading: boolean
  error: string | null
  fetchMapData: () => Promise<void>
  toggleLayerVisibility: (layerId: string) => void
  isLayerVisible: (layerId: string) => boolean
}

export const useMapStore = create<MapState>((set, get) => ({
  projects: [],
  layers: [],
  datasources: [],
  hiddenLayerIds: new Set<string>(),
  isLoading: false,
  error: null,

  fetchMapData: async () => {
    set({ isLoading: true, error: null })

    try {
      const [projects, layers, datasources] = await Promise.all([
        geodataService.fetchProjects(),
        geodataService.fetchLayers(),
        geodataService.fetchDatasources(),
      ])

      const hiddenLayerIds = new Set(
        layers.filter((layer) => !layer.visibility).map((layer) => layer.id),
      )

      set({
        projects,
        layers: [...layers].sort((left, right) => left.z_index - right.z_index),
        datasources,
        hiddenLayerIds,
      })
    } catch (error) {
      set({
        error: getUserFacingApiError(error, {
          context: 'map',
          fallbackMessage: 'Falha ao carregar dados do mapa.',
        }),
      })
      throw new Error('map_data_fetch_failed')
    } finally {
      set({ isLoading: false })
    }
  },

  toggleLayerVisibility: (layerId) => {
    const current = get().hiddenLayerIds
    const next = new Set(current)

    if (next.has(layerId)) {
      next.delete(layerId)
    } else {
      next.add(layerId)
    }

    set({ hiddenLayerIds: next })
  },

  isLayerVisible: (layerId) => !get().hiddenLayerIds.has(layerId),
}))
