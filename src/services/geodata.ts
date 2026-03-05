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
}
