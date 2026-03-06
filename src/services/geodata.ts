import { api } from './api.ts'
import type { AxiosResponse } from 'axios'
import type { PaginatedResponse } from '../types/api.ts'
import type { Datasource, Layer, Project, ProjectGeometry } from '../types/geospatial.ts'

interface RawProject {
  id: string | number
  name: string
  description: string
  geometry: unknown
  created_at: string
}

interface RawLayer {
  id: string | number
  name: string
  description: string
  project: string | number
  datasource: string | number
  visibility: boolean
  z_index: number
  style_config: Record<string, unknown>
  metadata: Record<string, unknown>
}

interface RawDatasource {
  id: string | number
  name: string
  description: string
  datasource_type: Datasource['datasource_type']
  storage_url: string
  metadata: Record<string, unknown>
  is_public: boolean
}

const toId = (value: string | number) => String(value)

const toRelativeApiPath = (nextUrl: string) => {
  try {
    const url = new URL(nextUrl)
    const versionedPrefix = '/api/v1'
    if (url.pathname.startsWith(versionedPrefix)) {
      return url.pathname.slice(versionedPrefix.length) + url.search
    }
    return `${url.pathname}${url.search}`
  } catch {
    return nextUrl
  }
}

const fetchAllPages = async <TRow>(path: string) => {
  let nextPath: string | null = path
  const aggregated: TRow[] = []

  while (nextPath) {
    const response: AxiosResponse<PaginatedResponse<TRow>> = await api.get<PaginatedResponse<TRow>>(
      nextPath,
    )
    aggregated.push(...response.data.results)
    nextPath = response.data.next ? toRelativeApiPath(response.data.next) : null
  }

  return aggregated
}

const parseProjectGeometry = (value: unknown): ProjectGeometry => {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parseProjectGeometry(parsed)
    } catch {
      return null
    }
  }

  if (typeof value === 'object') {
    return value as ProjectGeometry
  }

  return null
}

export const geodataService = {
  async fetchProjects() {
    const projects = await fetchAllPages<RawProject>('/projects/')
    return projects.map<Project>((project) => ({
      id: toId(project.id),
      name: project.name,
      description: project.description,
      geometry: parseProjectGeometry(project.geometry),
      created_at: project.created_at,
    }))
  },

  async createProject(data: { name: string; description: string; geometry?: ProjectGeometry }) {
    const response = await api.post<RawProject>('/projects/', {
      name: data.name,
      description: data.description,
      geometry: data.geometry ?? null,
    })
    
    return {
      id: toId(response.data.id),
      name: response.data.name,
      description: response.data.description,
      geometry: parseProjectGeometry(response.data.geometry),
      created_at: response.data.created_at,
    } satisfies Project
  },

  async fetchLayers() {
    const layers = await fetchAllPages<RawLayer>('/layers/')
    return layers.map<Layer>((layer) => ({
      id: toId(layer.id),
      name: layer.name,
      description: layer.description,
      project_id: toId(layer.project),
      datasource_id: toId(layer.datasource),
      visibility: layer.visibility,
      z_index: layer.z_index,
      style_config: layer.style_config ?? {},
      metadata: layer.metadata ?? {},
    }))
  },

  async createLayer(data: {
    name: string
    description: string
    project_id: string
    datasource_id: string
    style_config?: Record<string, unknown>
    metadata?: Record<string, unknown>
  }) {
    const response = await api.post<RawLayer>('/layers/', {
      name: data.name,
      description: data.description,
      project: data.project_id,
      datasource: data.datasource_id,
      visibility: true,
      z_index: 0,
      style_config: data.style_config ?? {},
      metadata: data.metadata ?? {},
    })

    return {
      id: toId(response.data.id),
      name: response.data.name,
      description: response.data.description,
      project_id: toId(response.data.project),
      datasource_id: toId(response.data.datasource),
      visibility: response.data.visibility,
      z_index: response.data.z_index,
      style_config: response.data.style_config ?? {},
      metadata: response.data.metadata ?? {},
    } satisfies Layer
  },

  async updateLayer(
    layerId: string,
    data: {
      name?: string
      description?: string
      datasource_id?: string
      style_config?: Record<string, unknown>
      metadata?: Record<string, unknown>
      visibility?: boolean
      z_index?: number
    },
  ) {
    const response = await api.patch<RawLayer>(`/layers/${layerId}/`, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.datasource_id !== undefined && { datasource: data.datasource_id }),
      ...(data.visibility !== undefined && { visibility: data.visibility }),
      ...(data.z_index !== undefined && { z_index: data.z_index }),
      ...(data.style_config !== undefined && { style_config: data.style_config }),
      ...(data.metadata !== undefined && { metadata: data.metadata }),
    })

    return {
      id: toId(response.data.id),
      name: response.data.name,
      description: response.data.description,
      project_id: toId(response.data.project),
      datasource_id: toId(response.data.datasource),
      visibility: response.data.visibility,
      z_index: response.data.z_index,
      style_config: response.data.style_config ?? {},
      metadata: response.data.metadata ?? {},
    } satisfies Layer
  },

  async deleteLayer(layerId: string): Promise<void> {
    await api.delete(`/layers/${layerId}/`)
  },

  async fetchDatasources() {
    const datasources = await fetchAllPages<RawDatasource>('/datasources/')
    return datasources.map<Datasource>((datasource) => ({
      id: toId(datasource.id),
      name: datasource.name,
      description: datasource.description,
      datasource_type: datasource.datasource_type,
      storage_url: datasource.storage_url,
      metadata: datasource.metadata ?? {},
      is_public: datasource.is_public,
    }))
  },

  async createDatasource(data: {
    name: string
    description: string
    datasource_type: Datasource['datasource_type']
    storage_url: string
    metadata?: Record<string, unknown>
  }) {
    const response = await api.post<RawDatasource>('/datasources/', {
      name: data.name,
      description: data.description,
      datasource_type: data.datasource_type,
      storage_url: data.storage_url,
      metadata: data.metadata ?? {},
    })

    return {
      id: toId(response.data.id),
      name: response.data.name,
      description: response.data.description,
      datasource_type: response.data.datasource_type,
      storage_url: response.data.storage_url,
      metadata: response.data.metadata ?? {},
      is_public: response.data.is_public,
    } satisfies Datasource
  },

  async createProjectAndLayer(data: {
    projectName: string
    projectDescription: string
    layerName: string
    layerDescription: string
    geometry: ProjectGeometry
    style_config?: Record<string, unknown>
  }) {
    // 1. Create project
    const project = await this.createProject({
      name: data.projectName,
      description: data.projectDescription,
    })

    // 2. Create datasource GeoJSON
    const geojsonString = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: data.geometry,
          properties: {},
        },
      ],
    })

    const datasource = await this.createDatasource({
      name: `${data.layerName} - Datasource`,
      description: `GeoJSON inline para ${data.layerName}`,
      datasource_type: 'vector',
      storage_url: `data:application/json,${encodeURIComponent(geojsonString)}`,
      metadata: { source: 'draw', created_at: new Date().toISOString() },
    })

    // 3. Create layer
    const geometryType = 
      data.geometry && typeof data.geometry === 'object' && 'type' in data.geometry 
        ? data.geometry.type 
        : 'unknown'
    
    await this.createLayer({
      name: data.layerName,
      description: data.layerDescription,
      project_id: project.id,
      datasource_id: datasource.id,
      style_config: data.style_config,
      metadata: { drawn: true, geometryType },
    })

    return project
  },
}
