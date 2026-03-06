import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar.tsx'
import { DrawControls } from '../components/Map/DrawControls.tsx'
import { LayerToggle } from '../components/Map/LayerToggle.tsx'
import {
  MapContainer,
  type MapToolboxActions,
  type MapToolboxState,
} from '../components/Map/MapContainer.tsx'
import { ProjectList } from '../components/Projects/ProjectList.tsx'
import { CreateProjectModal } from '../components/Projects/CreateProjectModal.tsx'
import { DeleteLayerModal } from '../components/Map/DeleteLayerModal.tsx'
import { getApiFailureTelemetry, getUserFacingApiError } from '../services/apiErrors.ts'
import { geodataService } from '../services/geodata.ts'
import { useAuthStore } from '../state/authStore.ts'
import { useMapStore } from '../state/mapStore.ts'
import { useOrgStore } from '../state/orgStore.ts'
import type { Layer, ProjectGeometry } from '../types/geospatial.ts'

export function MapPage() {
  const [apiFailureCount, setApiFailureCount] = useState(() => getApiFailureTelemetry().totalFailures)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [layerToDelete, setLayerToDelete] = useState<Layer | null>(null)
  const [zoomToGeometry, setZoomToGeometry] = useState<((geometry: ProjectGeometry) => void) | null>(null)
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
  const activeProjectId = useMapStore((state) => state.activeProjectId)
  const setProjectScope = useMapStore((state) => state.setProjectScope)
  const isLayerVisible = useMapStore((state) => state.isLayerVisible)
  const toggleLayerVisibility = useMapStore((state) => state.toggleLayerVisibility)

  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const isFreemium = useOrgStore((state) => state.isFreemium)
  const organizations = useOrgStore((state) => state.organizations)

  // Check if user has PRO/ENTERPRISE plan
  const hasPremiumPlan = organizations.some(
    (org) => org.plan === 'pro' || org.plan === 'enterprise'
  )
  const shouldShowUpgrade = !hasPremiumPlan
  const activeOrganization = organizations.find((organization) => organization.id === activeOrgId)
  const activeProject = projects.find((project) => project.id === activeProjectId)
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

  const handleMoveLayer = async (layerId: string, direction: 'up' | 'down') => {
    const currentIndex = layers.findIndex((layer) => layer.id === layerId)
    if (currentIndex === -1) {
      return
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= layers.length) {
      return
    }

    const currentLayer = layers[currentIndex]
    const targetLayer = layers[targetIndex]
    const busyKey = `layer-move-${direction}-${layerId}`

    markActionBusy(busyKey, true)
    setLayerActionError(null)

    try {
      await Promise.all([
        geodataService.updateLayer(currentLayer.id, { z_index: targetLayer.z_index }),
        geodataService.updateLayer(targetLayer.id, { z_index: currentLayer.z_index }),
      ])
      await fetchMapData()
    } catch (actionError) {
      setLayerActionError(
        getUserFacingApiError(actionError, {
          context: 'map',
          fallbackMessage: 'Não foi possível reordenar as camadas.',
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

  useEffect(() => {
    const updateFailureCounter = () => {
      setApiFailureCount(getApiFailureTelemetry().totalFailures)
    }

    window.addEventListener('coordgeo:api-failure', updateFailureCounter)
    return () => {
      window.removeEventListener('coordgeo:api-failure', updateFailureCounter)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar />

      <main className="grid min-h-0 flex-1 grid-cols-[340px_1fr] bg-slate-100">
      <aside className="relative z-10 flex min-h-0 flex-col gap-4 border-r border-slate-200 bg-white p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contexto ativo</p>
          <p className="mt-2 truncate text-sm font-semibold text-slate-900">
            {activeOrganization?.name ?? 'Organização não identificada'}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-200 px-2 py-0.5 font-medium text-slate-700">
              {activeOrganizationPlanLabel ?? 'Plano não disponível'}
            </span>
            <span>{isFreemium ? 'Modo freemium ativo' : 'Workspace colaborativo ativo'}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Projeto ativo: <span className="font-medium text-slate-700">{activeProject?.name ?? 'Nenhum projeto ativo'}</span>
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Toolbox</h2>
            <span className="text-xs text-slate-500">
              {toolboxState.isEditing ? 'Editando' : toolboxState.isDrawing ? 'Desenhando' : 'Pronto'}
            </span>
          </div>
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
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
            />
          ) : (
            <p className="text-xs text-slate-500">Carregando ferramentas de desenho...</p>
          )}
        </section>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <ProjectList
            projects={projects}
            onCreateClick={() => setIsCreateModalOpen(true)}
            onZoomToProject={(project) => zoomToGeometry?.(project.geometry)}
          />

          <LayerToggle
            layers={layers}
            isLayerVisible={isLayerVisible}
            onToggle={toggleLayerVisibility}
            onDelete={(layer) => setLayerToDelete(layer)}
            onEdit={handleEditLayer}
            onMoveUp={(layerId) => handleMoveLayer(layerId, 'up')}
            onMoveDown={(layerId) => handleMoveLayer(layerId, 'down')}
            onOpacityChange={handleLayerOpacityChange}
            isBusy={isLayerActionBusy}
          />
        </div>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Falhas de API (sessão)</span>
            <span className="font-semibold text-slate-700">{apiFailureCount}</span>
          </div>

          {layerActionError ? <p className="text-xs text-red-600">{layerActionError}</p> : null}

          <Link
            to="/settings"
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <span>Gerenciar dados</span>
            <span>→</span>
          </Link>

          {shouldShowUpgrade ? (
            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
              <p className="text-sm font-semibold">Plano PRO disponível</p>
              <p className="mt-1 text-xs text-blue-100">Use o menu da conta para fazer upgrade.</p>
            </div>
          ) : null}
        </section>

      </aside>

      <section className="relative z-0 min-h-0 overflow-hidden">
        <MapContainer
          className="h-full w-full"
          layers={layers}
          datasources={datasources}
          projects={projects}
          isLayerVisible={isLayerVisible}
          onMapReady={setZoomToGeometry}
          onToolboxActionsReady={handleToolboxActionsReady}
          onToolboxStateChange={handleToolboxStateChange}
        />

        {isLoading ? (
          <div className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-2 text-sm text-slate-700 shadow">
            Carregando dados geoespaciais...
          </div>
        ) : null}

        {error ? (
          <div className="absolute left-4 top-4 space-y-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 shadow">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                void fetchMapData()
              }}
              className="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}
      </section>
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <DeleteLayerModal
        isOpen={layerToDelete !== null}
        layer={layerToDelete}
        onClose={() => setLayerToDelete(null)}
      />
    </div>
  )
}
