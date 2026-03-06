import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import MapboxDraw from 'maplibre-gl-draw'
import 'maplibre-gl/dist/maplibre-gl.css'
import { DrawControls } from './DrawControls.tsx'
import { CreateLayerModal } from './CreateLayerModal.tsx'
import { EditLayerModal } from './EditLayerModal.tsx'
import { FeatureDetailsPanel } from './FeatureDetailsPanel.tsx'
import type {
  Datasource,
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJsonGeometry,
  Layer,
  Project,
  ProjectGeometry,
} from '../../types/geospatial.ts'

interface MapContainerProps {
  className?: string
  layers: Layer[]
  datasources: Datasource[]
  projects: Project[]
  isLayerVisible: (layerId: string) => boolean
  onMapReady?: (zoomToGeometry: (geometry: ProjectGeometry) => void) => void
}

const sourceIdFor = (datasourceId: string) => `coordgeo-source-${datasourceId}`
const layerIdFor = (layerId: string) => `coordgeo-layer-${layerId}`

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseString = (value: unknown) => (typeof value === 'string' ? value : undefined)
const parseNumber = (value: unknown) => (typeof value === 'number' ? value : undefined)

const parseLayerType = (value: unknown): maplibregl.LayerSpecification['type'] | undefined => {
  const parsed = parseString(value)
  if (!parsed) {
    return undefined
  }

  const validTypes: maplibregl.LayerSpecification['type'][] = [
    'background',
    'fill',
    'line',
    'symbol',
    'circle',
    'heatmap',
    'fill-extrusion',
    'raster',
    'hillshade',
  ]

  return validTypes.includes(parsed as maplibregl.LayerSpecification['type'])
    ? (parsed as maplibregl.LayerSpecification['type'])
    : undefined
}

const sourceFromDatasource = (
  datasource: Datasource,
): maplibregl.SourceSpecification | maplibregl.CanvasSourceSpecification => {
  // If it's a data URI or inline GeoJSON, treat as geojson source
  if (datasource.storage_url.startsWith('data:application/json')) {
    return {
      type: 'geojson',
      data: datasource.storage_url,
    }
  }

  switch (datasource.datasource_type) {
    case 'raster':
      return {
        type: 'raster',
        tiles: [datasource.storage_url],
        tileSize: 256,
      }
    case 'vector':
    case 'mvt':
    case 'pmtiles':
    default:
      return {
        type: 'vector',
        url: datasource.storage_url,
      }
  }
}

const defaultLayerType = (datasource: Datasource) => {
  if (datasource.datasource_type === 'raster') {
    return 'raster'
  }
  // Detect inline GeoJSON by data URI
  if (datasource.storage_url.startsWith('data:application/json')) {
    return 'fill'
  }
  return 'line'
}

const BRAZIL_BOUNDS: [[number, number], [number, number]] = [
  [-73.99, -33.75],
  [-34.79, 5.27],
]

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isPosition = (value: unknown): value is [number, number] => {
  if (!Array.isArray(value) || value.length < 2) {
    return false
  }
  return isNumber(value[0]) && isNumber(value[1])
}

const collectCoordinates = (coordinates: unknown, out: Array<[number, number]>) => {
  if (isPosition(coordinates)) {
    out.push([coordinates[0], coordinates[1]])
    return
  }

  if (Array.isArray(coordinates)) {
    coordinates.forEach((item) => collectCoordinates(item, out))
  }
}

const appendGeometryCoordinates = (geometry: GeoJsonGeometry | null | undefined, out: Array<[number, number]>) => {
  if (!geometry) {
    return
  }

  if (geometry.type === 'GeometryCollection' && Array.isArray(geometry.geometries)) {
    geometry.geometries.forEach((child) => appendGeometryCoordinates(child, out))
    return
  }

  collectCoordinates(geometry.coordinates, out)
}

const extractPointsFromProjectGeometry = (geometry: ProjectGeometry): Array<[number, number]> => {
  if (!geometry) {
    return []
  }

  if ((geometry as GeoJsonFeatureCollection).type === 'FeatureCollection') {
    const collection = geometry as GeoJsonFeatureCollection
    return collection.features.flatMap((feature) => extractPointsFromProjectGeometry(feature))
  }

  if ((geometry as GeoJsonFeature).type === 'Feature') {
    const feature = geometry as GeoJsonFeature
    return extractPointsFromProjectGeometry(feature.geometry)
  }

  const points: Array<[number, number]> = []
  appendGeometryCoordinates(geometry as GeoJsonGeometry, points)
  return points
}

const boundsFromPoints = (points: Array<[number, number]>): [[number, number], [number, number]] | null => {
  if (points.length === 0) {
    return null
  }

  let west = points[0][0]
  let south = points[0][1]
  let east = points[0][0]
  let north = points[0][1]

  points.forEach(([lng, lat]) => {
    if (lng < west) west = lng
    if (lng > east) east = lng
    if (lat < south) south = lat
    if (lat > north) north = lat
  })

  if (west === east) {
    west -= 0.05
    east += 0.05
  }

  if (south === north) {
    south -= 0.05
    north += 0.05
  }

  return [
    [west, south],
    [east, north],
  ]
}

const getInitialBounds = (projects: Project[]) => {
  for (const project of projects) {
    const points = extractPointsFromProjectGeometry(project.geometry)
    const bounds = boundsFromPoints(points)
    if (bounds) {
      return bounds
    }
  }

  return BRAZIL_BOUNDS
}

const toLayerSpec = (
  layer: Layer,
  datasource: Datasource,
  isVisible: boolean,
): maplibregl.LayerSpecification => {
  const styleConfig = isObject(layer.style_config) ? layer.style_config : {}
  const metadata = isObject(datasource.metadata) ? datasource.metadata : {}

  const type = parseLayerType(styleConfig.type) ?? defaultLayerType(datasource)

  const spec: Record<string, unknown> = {
    id: layerIdFor(layer.id),
    source: sourceIdFor(datasource.id),
    type,
    layout: {
      visibility: isVisible ? 'visible' : 'none',
      ...(isObject(styleConfig.layout) ? styleConfig.layout : {}),
    },
    paint: isObject(styleConfig.paint) ? styleConfig.paint : {},
  }

  const sourceLayer = parseString(styleConfig['source-layer']) ?? parseString(metadata.source_layer)
  // Only add source-layer for vector tiles, not for inline GeoJSON
  const isInlineGeoJson = datasource.storage_url.startsWith('data:application/json')
  if (sourceLayer && !isInlineGeoJson) {
    spec['source-layer'] = sourceLayer
  }

  const minzoom = parseNumber(styleConfig.minzoom)
  if (minzoom !== undefined) {
    spec.minzoom = minzoom
  }

  const maxzoom = parseNumber(styleConfig.maxzoom)
  if (maxzoom !== undefined) {
    spec.maxzoom = maxzoom
  }

  return spec as maplibregl.LayerSpecification
}

export function MapContainer({ className, layers, datasources, projects, isLayerVisible, onMapReady }: MapContainerProps) {
  const mapElement = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const onMapReadyRef = useRef(onMapReady)
  const dynamicSourceIds = useRef<string[]>([])
  const dynamicLayerIds = useRef<string[]>([])
  const hasAppliedInitialBounds = useRef(false)

  const [isDrawing, setIsDrawing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [drawnGeometry, setDrawnGeometry] = useState<GeoJsonGeometry | null>(null)
  const [isLayerModalOpen, setIsLayerModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)

  useEffect(() => {
    onMapReadyRef.current = onMapReady
  }, [onMapReady])

  const clearDynamicMapData = (map: maplibregl.Map) => {
    dynamicLayerIds.current.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
    })

    dynamicSourceIds.current.forEach((sourceId) => {
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId)
      }
    })

    dynamicLayerIds.current = []
    dynamicSourceIds.current = []
  }

  useEffect(() => {
    if (!mapElement.current || mapRef.current) {
      return
    }

    mapRef.current = new maplibregl.Map({
      container: mapElement.current,
      style: import.meta.env.VITE_MAP_STYLE ?? 'https://demotiles.maplibre.org/style.json',
      center: [-47.8828, -15.7939],
      zoom: 3,
    })

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Initialize draw control
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
    })
    mapRef.current.addControl(draw as unknown as maplibregl.IControl, 'top-left')
    drawRef.current = draw

    // Expose zoom to geometry function
    const zoomToGeometry = (geometry: ProjectGeometry) => {
      if (!mapRef.current || !geometry) return

      const points = extractPointsFromProjectGeometry(geometry)
      const bounds = boundsFromPoints(points)

      if (bounds) {
        mapRef.current.fitBounds(bounds, {
          padding: 40,
          duration: 1000,
        })
      }
    }

    onMapReadyRef.current?.(zoomToGeometry)

    // Listen for draw events
    mapRef.current.on('draw.create', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0]
        setDrawnGeometry(feature.geometry as GeoJsonGeometry)
        setIsLayerModalOpen(true)
        setIsDrawing(false)
        draw.deleteAll()
      }
    })

    // Listen for draw update events (when editing existing geometries)
    mapRef.current.on('draw.update', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0]
        setDrawnGeometry(feature.geometry as GeoJsonGeometry)
        setIsEditModalOpen(true)
        setIsEditing(false)
        draw.deleteAll()
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        drawRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    if (hasAppliedInitialBounds.current) {
      return
    }

    const applyInitialBounds = () => {
      if (!map.isStyleLoaded()) {
        return
      }

      map.fitBounds(getInitialBounds(projects), {
        padding: 40,
        duration: 0,
      })
      hasAppliedInitialBounds.current = true
    }

    if (map.isStyleLoaded()) {
      applyInitialBounds()
    } else {
      map.once('load', applyInitialBounds)
    }
  }, [projects])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const syncLayers = () => {
      if (!map.isStyleLoaded()) {
        return
      }

      clearDynamicMapData(map)

      const datasourceById = new Map(datasources.map((datasource) => [datasource.id, datasource]))

      layers.forEach((layer) => {
        const datasource = datasourceById.get(layer.datasource_id)
        if (!datasource) {
          return
        }

        const sourceId = sourceIdFor(datasource.id)
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, sourceFromDatasource(datasource))
          dynamicSourceIds.current.push(sourceId)
        }

        const layerSpec = toLayerSpec(layer, datasource, isLayerVisible(layer.id))
        map.addLayer(layerSpec)
        dynamicLayerIds.current.push(layerSpec.id)
      })
    }

    if (map.isStyleLoaded()) {
      syncLayers()
    } else {
      map.once('load', syncLayers)
    }

    return () => {
      if (mapRef.current) {
        clearDynamicMapData(mapRef.current)
      }
    }
  }, [datasources, isLayerVisible, layers])

  // Setup click listener for feature details
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) {
      return
    }

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point)

      // Find the first feature that belongs to one of our dynamic layers
      const clickedFeature = features.find((feature) =>
        dynamicLayerIds.current.includes(feature.layer.id),
      )

      if (clickedFeature) {
        // Find the layer and datasource associated with this feature
        const layerId = clickedFeature.layer.id.replace('coordgeo-layer-', '')
        setSelectedLayerId(layerId)
      } else {
        setSelectedLayerId(null)
      }
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [])

  const handleDrawPoint = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_point')
      setIsDrawing(true)
    }
  }

  const handleDrawLineString = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_line_string')
      setIsDrawing(true)
    }
  }

  const handleDrawPolygon = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon')
      setIsDrawing(true)
    }
  }

  const handleEditLayer = () => {
    // Verifica se há layers editáveis
    const editableLayers = layers.filter((layer) => {
      const datasource = datasources.find((ds) => ds.id === layer.datasource_id)
      return datasource?.storage_url.startsWith('data:application/json')
    })

    if (editableLayers.length === 0) {
      setIsEditModalOpen(true) // Abre o modal que mostrará mensagem de "sem layers"
      return
    }

    // Pega a primeira layer editável (ou a última criada)
    const layerToEdit = editableLayers[editableLayers.length - 1]
    const datasource = datasources.find((ds) => ds.id === layerToEdit.datasource_id)
    
    if (datasource && drawRef.current) {
      // Decodifica o GeoJSON do data URI
      try {
        const dataUrl = datasource.storage_url
        const jsonPart = dataUrl.split(',')[1]
        const geojsonString = decodeURIComponent(jsonPart)
        const geojson = JSON.parse(geojsonString)
        
        // Adiciona a feature ao draw control
        if (geojson.type === 'FeatureCollection' && geojson.features.length > 0) {
          const feature = geojson.features[0]
          const featureIds = drawRef.current.add(feature)
          
          if (featureIds && featureIds.length > 0) {
            // Entra em modo de edição direto
            drawRef.current.changeMode('direct_select', { featureId: featureIds[0] })
            setIsEditing(true)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar geometria para edição:', error)
        setIsEditModalOpen(true)
      }
    }
  }

  const handleCancelDraw = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('simple_select')
      drawRef.current.deleteAll()
      setIsDrawing(false)
      setIsEditing(false)
    }
  }

  // Verifica se há layers editáveis
  const hasEditableLayers = layers.some((layer) => {
    const datasource = datasources.find((ds) => ds.id === layer.datasource_id)
    return datasource?.storage_url.startsWith('data:application/json')
  })

  return (
    <div className="relative h-full w-full">
      <div ref={mapElement} className={className} />

      <div className="absolute right-4 top-4">
        <DrawControls
          onDrawPoint={handleDrawPoint}
          onDrawLineString={handleDrawLineString}
          onDrawPolygon={handleDrawPolygon}
          onEditLayer={handleEditLayer}
          onCancelDraw={handleCancelDraw}
          isDrawing={isDrawing}
          isEditing={isEditing}
          hasEditableLayers={hasEditableLayers}
        />
      </div>

      <CreateLayerModal
        isOpen={isLayerModalOpen}
        geometry={drawnGeometry}
        projects={projects}
        onClose={() => {
          setIsLayerModalOpen(false)
          setDrawnGeometry(null)
        }}
        onSuccess={() => {
          setDrawnGeometry(null)
        }}
      />

      <EditLayerModal
        isOpen={isEditModalOpen}
        geometry={drawnGeometry}
        layers={layers}
        datasources={datasources}
        onClose={() => {
          setIsEditModalOpen(false)
          setDrawnGeometry(null)
        }}
        onSuccess={() => {
          setDrawnGeometry(null)
        }}
      />

      <FeatureDetailsPanel
        layer={selectedLayerId ? layers.find((l) => l.id === selectedLayerId) ?? null : null}
        datasource={
          selectedLayerId
            ? (() => {
                const layer = layers.find((l) => l.id === selectedLayerId)
                return layer ? datasources.find((d) => d.id === layer.datasource_id) ?? null : null
              })()
            : null
        }
        onClose={() => setSelectedLayerId(null)}
      />
    </div>
  )
}
