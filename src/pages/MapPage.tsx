import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayerToggle } from '../components/Map/LayerToggle.tsx'
import { MapContainer } from '../components/Map/MapContainer.tsx'
import { ProjectList } from '../components/Projects/ProjectList.tsx'
import { CreateProjectModal } from '../components/Projects/CreateProjectModal.tsx'
import { DeleteLayerModal } from '../components/Map/DeleteLayerModal.tsx'
import { getApiFailureTelemetry } from '../services/apiErrors.ts'
import { useAuthStore } from '../state/authStore.ts'
import { useMapStore } from '../state/mapStore.ts'
import { useOrgStore } from '../state/orgStore.ts'
import type { Layer, ProjectGeometry } from '../types/geospatial.ts'

export function MapPage() {
  const navigate = useNavigate()
  const [apiFailureCount, setApiFailureCount] = useState(() => getApiFailureTelemetry().totalFailures)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [layerToDelete, setLayerToDelete] = useState<Layer | null>(null)
  const [zoomToGeometry, setZoomToGeometry] = useState<((geometry: ProjectGeometry) => void) | null>(null)

  const fetchMapData = useMapStore((state) => state.fetchMapData)
  const isLoading = useMapStore((state) => state.isLoading)
  const error = useMapStore((state) => state.error)
  const layers = useMapStore((state) => state.layers)
  const projects = useMapStore((state) => state.projects)
  const datasources = useMapStore((state) => state.datasources)
  const isLayerVisible = useMapStore((state) => state.isLayerVisible)
  const toggleLayerVisibility = useMapStore((state) => state.toggleLayerVisibility)

  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const clearActiveOrg = useOrgStore((state) => state.clearActiveOrg)
  const isFreemium = useOrgStore((state) => state.isFreemium)

  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    void fetchMapData()
  }, [fetchMapData])

  useEffect(() => {
    const updateFailureCounter = () => {
      setApiFailureCount(getApiFailureTelemetry().totalFailures)
    }

    window.addEventListener('coordgeo:api-failure', updateFailureCounter)
    return () => {
      window.removeEventListener('coordgeo:api-failure', updateFailureCounter)
    }
  }, [])

  const handleSwitchOrg = () => {
    clearActiveOrg()
    navigate('/select-org', { replace: true })
  }

  const handleLogout = () => {
    logout()
    clearActiveOrg()
    navigate('/login', { replace: true })
  }

  return (
    <main className="grid min-h-screen grid-cols-[320px_1fr] bg-slate-100">
      <aside className="flex h-screen flex-col gap-4 border-r border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">CoordGeo</h1>
          <p className="text-xs text-slate-600">Org ativa: {activeOrgId ?? '-'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs text-slate-600">
          <div className="rounded-lg border border-slate-200 p-2">
            <p className="font-semibold text-slate-900">{projects.length}</p>
            <p>Projetos</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-2">
            <p className="font-semibold text-slate-900">{datasources.length}</p>
            <p>Datasources</p>
          </div>
        </div>

        <p className="text-xs text-slate-500">Falhas de API (sessão): {apiFailureCount}</p>

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
        />

        <div className="mt-auto space-y-2">
          {!isFreemium && (
            <button
              type="button"
              onClick={handleSwitchOrg}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Trocar organização
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Sair
          </button>
        </div>
      </aside>

      <section className="relative h-screen">
        <MapContainer
          className="h-full w-full"
          layers={layers}
          datasources={datasources}
          projects={projects}
          isLayerVisible={isLayerVisible}
          onMapReady={setZoomToGeometry}
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

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <DeleteLayerModal
        isOpen={layerToDelete !== null}
        layer={layerToDelete}
        onClose={() => setLayerToDelete(null)}
      />
    </main>
  )
}
