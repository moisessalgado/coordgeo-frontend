export type DatasourceType = 'vector' | 'raster' | 'pmtiles' | 'mvt'

export type GeometryCoordinates =
  | [number, number]
  | [number, number, number]
  | GeometryCoordinates[]

export interface GeoJsonGeometry {
  type: string
  coordinates?: GeometryCoordinates
  geometries?: GeoJsonGeometry[]
}

export interface GeoJsonFeature {
  type: 'Feature'
  geometry: GeoJsonGeometry | null
  properties?: Record<string, unknown>
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

export type ProjectGeometry =
  | GeoJsonGeometry
  | GeoJsonFeature
  | GeoJsonFeatureCollection
  | null

export interface Project {
  id: string
  name: string
  description: string
  geometry: ProjectGeometry
  created_at: string
}

export interface Layer {
  id: string
  name: string
  description: string
  project_id: string
  datasource_id: string
  visibility: boolean
  z_index: number
  style_config: Record<string, unknown>
  metadata: Record<string, unknown>
}

export interface Datasource {
  id: string
  name: string
  description: string
  datasource_type: DatasourceType
  storage_url: string
  metadata: Record<string, unknown>
  is_public: boolean
}
