import { create } from 'zustand'
import { geodataService } from '../services/geodata.ts'
import { getUserFacingApiError } from '../services/apiErrors.ts'
import type { Datasource, Layer, Project } from '../types/geospatial.ts'

const PROJECT_KEY_PREFIX = 'coordgeo.activeProjectId'

const safeStorageGet = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

const safeStorageRemove = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    return
  }
}

interface MapState {
  projects: Project[]
  layers: Layer[]
  datasources: Datasource[]
  hiddenLayerIds: Set<string>
  activeProjectId: string | null
  projectScopeKey: string | null
  isLoading: boolean
  error: string | null
  fetchMapData: () => Promise<void>
  setProjectScope: (scopeKey: string | null) => void
  setActiveProject: (projectId: string | null) => void
  syncActiveProject: (projects: Project[]) => void
  toggleLayerVisibility: (layerId: string) => void
  isLayerVisible: (layerId: string) => boolean
}

export const useMapStore = create<MapState>((set, get) => ({
  projects: [],
  layers: [],
  datasources: [],
  hiddenLayerIds: new Set<string>(),
  activeProjectId: null,
  projectScopeKey: null,
  isLoading: false,
  error: null,

  setProjectScope: (scopeKey) => {
    if (!scopeKey) {
      set({ projectScopeKey: null, activeProjectId: null })
      return
    }

    const storageKey = `${PROJECT_KEY_PREFIX}.${scopeKey}`
    const scopedActiveProjectId = safeStorageGet(storageKey)
    set({ projectScopeKey: scopeKey, activeProjectId: scopedActiveProjectId })
  },

  setActiveProject: (projectId) => {
    const { projectScopeKey } = get()

    if (projectScopeKey) {
      const storageKey = `${PROJECT_KEY_PREFIX}.${projectScopeKey}`
      if (projectId) {
        safeStorageSet(storageKey, projectId)
      } else {
        safeStorageRemove(storageKey)
      }
    }

    set({ activeProjectId: projectId })
  },

  syncActiveProject: (projects) => {
    const { activeProjectId, setActiveProject } = get()

    if (projects.length === 0) {
      setActiveProject(null)
      return
    }

    const hasCurrentProject =
      !!activeProjectId && projects.some((project) => project.id === activeProjectId)

    if (hasCurrentProject) {
      return
    }

    // If no valid persisted project exists, default to the first project.
    setActiveProject(projects[0].id)
  },

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

      get().syncActiveProject(projects)
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
