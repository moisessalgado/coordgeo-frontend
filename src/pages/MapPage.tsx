import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar.tsx'
import { DrawControls } from '../components/Map/DrawControls.tsx'
import { LayerToggle } from '../components/Map/LayerToggle.tsx'
import { ActionButton } from '../components/UI/ActionButton.tsx'
import { SectionHeader } from '../components/UI/SectionHeader.tsx'
import {
  MapContainer,
  type MapToolboxActions,
  type MapToolboxState,
} from '../components/Map/MapContainer.tsx'
import { DeleteLayerModal } from '../components/Map/DeleteLayerModal.tsx'
import { getUserFacingApiError } from '../services/apiErrors.ts'
import { geodataService } from '../services/geodata.ts'
import { useAuthStore } from '../state/authStore.ts'
import { useMapStore } from '../state/mapStore.ts'
import { useOrgStore } from '../state/orgStore.ts'
import type { Layer } from '../types/geospatial.ts'

export function MapPage() {
  const [layerToDelete, setLayerToDelete] = useState<Layer | null>(null)
  const [layerActionError, setLayerActionError] = useState<string | null>(null)
  const [layerActionBusyKeys, setLayerActionBusyKeys] = useState<Set<string>>(new Set())
  const [toolboxActions, setToolboxActions] = useState<MapToolboxActions | null>(null)
  const [toolboxState, setToolboxState] = useState<MapToolboxState>({
    isDrawing: false,
    isEditing: false,
    hasEditableLayers: false,
  })

  const accessToken = useAuthStore((state) => state.accessToken)
  const userProfile = useAuthStore((state) => state.userProfile)
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser)

  const fetchMapData = useMapStore((state) => state.fetchMapData)
  const isLoading = useMapStore((state) => state.isLoading)
  const error = useMapStore((state) => state.error)
  const layers = useMapStore((state) => state.layers)
  const projects = useMapStore((state) => state.projects)
  const datasources = useMapStore((state) => state.datasources)
  const setProjectScope = useMapStore((state) => state.setProjectScope)
  const hiddenLayerIds = useMapStore((state) => state.hiddenLayerIds)
  const toggleLayerVisibility = useMapStore((state) => state.toggleLayerVisibility)

  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const organizations = useOrgStore((state) => state.organizations)

  const activeOrganization = organizations.find((organization) => organization.id === activeOrgId)
  const activeOrganizationPlanLabel = activeOrganization
    ? activeOrganization.plan === 'enterprise'
      ? 'Enterprise'
      : activeOrganization.plan === 'pro'
        ? 'PRO'
        : 'Freemium'
    : null

  const projectScopeKey = activeOrgId
    ? `${userProfile?.id ?? 'anon'}.${activeOrgId}`
    : null

  const markActionBusy = (key: string, isBusy: boolean) => {
    setLayerActionBusyKeys((current) => {
      const next = new Set(current)
      if (isBusy) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }

  const isLayerActionBusy = (key: string) => layerActionBusyKeys.has(key)

  const isLayerVisible = useCallback(
    (layerId: string) => !hiddenLayerIds.has(layerId),
    [hiddenLayerIds],
  )

  const getOpacityPaintKey = (layer: Layer) => {
    const style = layer.style_config ?? {}
    const paint = (style.paint as Record<string, unknown> | undefined) ?? {}
    const type = typeof style.type === 'string' ? style.type : ''

    if (type === 'line' || typeof paint['line-opacity'] === 'number') {
      return 'line-opacity'
    }

    if (type === 'circle' || typeof paint['circle-opacity'] === 'number') {
      return 'circle-opacity'
    }

    return 'fill-opacity'
  }

  const getColorPaintKey = (layer: Layer) => {
    const style = layer.style_config ?? {}
    const paint = (style.paint as Record<string, unknown> | undefined) ?? {}
    const type = typeof style.type === 'string' ? style.type : ''

    if (type === 'line' || typeof paint['line-color'] === 'string') {
      return 'line-color'
    }

    if (type === 'circle' || typeof paint['circle-color'] === 'string') {
      return 'circle-color'
    }

    return 'fill-color'
  }

  const handleEditLayer = async (layerId: string, name: string, description: string) => {
    const busyKey = `layer-edit-${layerId}`
    markActionBusy(busyKey, true)
    setLayerActionError(null)

    try {
      await geodataService.updateLayer(layerId, { name, description })
      await fetchMapData()
    } catch (actionError) {
      const message = getUserFacingApiError(actionError, {
        context: 'map',
        fallbackMessage: 'Não foi possível atualizar a camada.',
      })
      setLayerActionError(message)
      throw actionError
    } finally {
      markActionBusy(busyKey, false)
    }
  }

  const handleReorderLayers = async (sourceLayerId: string, targetLayerId: string) => {
    if (sourceLayerId === targetLayerId) {
      return
    }

    const busyKey = `layer-reorder-${sourceLayerId}`

    markActionBusy(busyKey, true)
    setLayerActionError(null)

    try {
      const orderedLayers = [...layers].sort((left, right) => {
        if (left.z_index !== right.z_index) {
          return left.z_index - right.z_index
        }
        return left.id.localeCompare(right.id)
      })

      const sourceIndex = orderedLayers.findIndex((layer) => layer.id === sourceLayerId)
      if (sourceIndex === -1) {
        return
      }

      const destinationIndex = orderedLayers.findIndex((layer) => layer.id === targetLayerId)
      if (destinationIndex < 0 || destinationIndex >= orderedLayers.length) {
        return
      }

      const [movedLayer] = orderedLayers.splice(sourceIndex, 1)
      orderedLayers.splice(destinationIndex, 0, movedLayer)

      const updates = orderedLayers
        .map((layer, index) => ({ id: layer.id, nextZIndex: index, currentZIndex: layer.z_index }))
        .filter((entry) => entry.nextZIndex !== entry.currentZIndex)

      await Promise.all(
        updates.map((entry) => geodataService.updateLayer(entry.id, { z_index: entry.nextZIndex })),
      )

      await fetchMapData()
    } catch (actionError) {
      setLayerActionError(
        getUserFacingApiError(actionError, {
          context: 'map',
          fallbackMessage: 'Não foi possível reordenar as camadas via arrastar e soltar.',
        }),
      )
    } finally {
      markActionBusy(busyKey, false)
    }
  }

  const handleLayerColorChange = async (layerId: string, color: string) => {
    const layer = layers.find((item) => item.id === layerId)
    if (!layer) {
      return
    }

    const busyKey = `layer-color-${layerId}`
    markActionBusy(busyKey, true)
    setLayerActionError(null)

    try {
      const style = layer.style_config ?? {}
      const paint = ((style.paint as Record<string, unknown> | undefined) ?? {})
      const colorKey = getColorPaintKey(layer)
      const currentColor = paint[colorKey]

      if (typeof currentColor === 'string' && currentColor.toLowerCase() === color.toLowerCase()) {
        return
      }

      const nextPaint = {
        ...paint,
        [colorKey]: color,
      }

      await geodataService.updateLayer(layer.id, {
        style_config: {
          ...style,
          paint: nextPaint,
        },
      })
      await fetchMapData()
    } catch (actionError) {
      setLayerActionError(
        getUserFacingApiError(actionError, {
          context: 'map',
          fallbackMessage: 'Não foi possível atualizar a cor da camada.',
        }),
      )
    } finally {
      markActionBusy(busyKey, false)
    }
  }

  const handleLayerOpacityChange = async (layerId: string, opacityPercent: number) => {
    const layer = layers.find((item) => item.id === layerId)
    if (!layer) {
      return
    }

    const busyKey = `layer-opacity-${layerId}`
    markActionBusy(busyKey, true)
    setLayerActionError(null)

    try {
      const style = layer.style_config ?? {}
      const paint = ((style.paint as Record<string, unknown> | undefined) ?? {})
      const opacityKey = getOpacityPaintKey(layer)
      const currentOpacityRaw = paint[opacityKey]
      const currentOpacity =
        typeof currentOpacityRaw === 'number' && Number.isFinite(currentOpacityRaw)
          ? Math.max(0, Math.min(1, currentOpacityRaw))
          : 1
      const nextOpacity = Math.max(0, Math.min(1, opacityPercent / 100))

      if (Math.abs(currentOpacity - nextOpacity) < 0.001) {
        return
      }

      const nextPaint = {
        ...paint,
        [opacityKey]: nextOpacity,
      }

      await geodataService.updateLayer(layer.id, {
        style_config: {
          ...style,
          paint: nextPaint,
        },
      })
      await fetchMapData()
    } catch (actionError) {
      setLayerActionError(
        getUserFacingApiError(actionError, {
          context: 'map',
          fallbackMessage: 'Não foi possível atualizar a transparência da camada.',
        }),
      )
    } finally {
      markActionBusy(busyKey, false)
    }
  }

  const handleToolboxActionsReady = useCallback((actions: MapToolboxActions) => {
    setToolboxActions(actions)
  }, [])

  const handleToolboxStateChange = useCallback((state: MapToolboxState) => {
    setToolboxState(state)
  }, [])

  useEffect(() => {
    if (accessToken && !userProfile) {
      void fetchCurrentUser()
    }
  }, [accessToken, fetchCurrentUser, userProfile])

  useEffect(() => {
    setProjectScope(projectScopeKey)
  }, [projectScopeKey, setProjectScope])

  useEffect(() => {
    if (!activeOrgId) {
      return
    }

    void fetchMapData()
  }, [activeOrgId, fetchMapData, projectScopeKey])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0">
        <Navbar />
      </div>

      <main className="grid h-full min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,46vh)_minmax(0,1fr)] overflow-hidden bg-slate-100 xl:grid-cols-[380px_minmax(0,1fr)] xl:grid-rows-1">
      <aside className="relative z-10 flex min-h-0 min-w-0 flex-col gap-4 overflow-hidden border-b border-slate-200 bg-white p-4 xl:border-b-0 xl:border-r xl:p-5">
        <section className="sidebar-card-soft space-y-3">
          <p className="sidebar-label">Contexto ativo</p>
          <p className="mt-2 truncate text-sm font-semibold text-slate-900">
            {activeOrganization?.name ?? 'Organização não identificada'}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-200 px-2 py-0.5 font-medium text-slate-700">
              {activeOrganizationPlanLabel ?? 'Plano não disponível'}
            </span>
            <span>Workspace colaborativo ativo</span>
          </div>
        </section>

        <section className="sidebar-card space-y-3">
          <SectionHeader
            title="Toolbox"
            subtitle={toolboxState.isEditing ? 'Editando geometria' : toolboxState.isDrawing ? 'Desenhando nova geometria' : 'Pronto para desenhar'}
          />
          {toolboxActions ? (
            <DrawControls
              onDrawPoint={toolboxActions.drawPoint}
              onDrawLineString={toolboxActions.drawLineString}
              onDrawPolygon={toolboxActions.drawPolygon}
              onEditLayer={toolboxActions.editLayer}
              onCancelDraw={toolboxActions.cancelDraw}
              isDrawing={toolboxState.isDrawing}
              isEditing={toolboxState.isEditing}
              hasEditableLayers={toolboxState.hasEditableLayers}
              className="grid grid-cols-4 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2"
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Carregando ferramentas de desenho...
            </div>
          )}
        </section>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-1">
          <LayerToggle
            layers={layers}
            isLayerVisible={isLayerVisible}
            onToggle={toggleLayerVisibility}
            onDelete={(layer) => setLayerToDelete(layer)}
            onEdit={handleEditLayer}
            onReorder={handleReorderLayers}
            onOpacityChange={handleLayerOpacityChange}
            onColorChange={handleLayerColorChange}
            isBusy={isLayerActionBusy}
          />

          {layerActionError ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {layerActionError}
            </div>
          ) : null}
        </div>

        <section className="sidebar-card-soft space-y-3">
          <Link
            to="/settings"
            className="focus-ui flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <span>Gerenciar dados</span>
            <span>→</span>
          </Link>
        </section>

      </aside>

      <section className="relative z-0 min-h-0 min-w-0 overflow-hidden">
        <MapContainer
          className="h-full w-full"
          layers={layers}
          datasources={datasources}
          projects={projects}
          isLayerVisible={isLayerVisible}
          onToolboxActionsReady={handleToolboxActionsReady}
          onToolboxStateChange={handleToolboxStateChange}
        />

        {isLoading ? (
          <div className="absolute left-4 top-4 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-700 shadow-sm">
            Carregando dados geoespaciais...
          </div>
        ) : null}

        {error ? (
          <div className="absolute left-4 top-4 space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
            <p>{error}</p>
            <ActionButton
              label="Tentar novamente"
              variant="secondary"
              className="border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => {
                void fetchMapData()
              }}
            />
          </div>
        ) : null}
      </section>
      </main>

      <DeleteLayerModal
        isOpen={layerToDelete !== null}
        layer={layerToDelete}
        onClose={() => setLayerToDelete(null)}
      />
    </div>
  )
}
