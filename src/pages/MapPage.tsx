import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar.tsx'
import { LayerToggle } from '../components/Map/LayerToggle.tsx'
import { MapContainer } from '../components/Map/MapContainer.tsx'
import { ProjectList } from '../components/Projects/ProjectList.tsx'
import { CreateProjectModal } from '../components/Projects/CreateProjectModal.tsx'
import { DeleteLayerModal } from '../components/Map/DeleteLayerModal.tsx'
import { getApiFailureTelemetry } from '../services/apiErrors.ts'
import { useMapStore } from '../state/mapStore.ts'
import { useOrgStore } from '../state/orgStore.ts'
import type { Layer, ProjectGeometry } from '../types/geospatial.ts'

export function MapPage() {
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
  const isFreemium = useOrgStore((state) => state.isFreemium)
  const organizations = useOrgStore((state) => state.organizations)

  // Check if user has PRO/ENTERPRISE plan
  const hasPremiumPlan = organizations.some(
    (org) => org.plan === 'pro' || org.plan === 'enterprise'
  )
  const shouldShowUpgrade = !hasPremiumPlan

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

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar />

      <main className="grid min-h-0 flex-1 grid-cols-[320px_1fr] bg-slate-100">
      <aside className="relative z-10 flex min-h-0 flex-col gap-4 border-r border-slate-200 bg-white p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Organização ativa</p>
          <p className="mt-2 truncate text-sm font-semibold text-slate-900">{activeOrgId ?? '-'}</p>
          <p className="mt-2 text-xs text-slate-500">
            {isFreemium ? 'Modo freemium ativo' : 'Workspace colaborativo ativo'}
          </p>
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

        {shouldShowUpgrade && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-white">
            <div className="flex items-center justify-center gap-2">
              <span>⭐</span>
              <span className="text-sm font-semibold">Plano PRO disponível</span>
            </div>
            <p className="mt-2 text-center text-xs text-blue-100">Use o menu da conta no topo direito para fazer upgrade.</p>
          </div>
        )}

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

      </aside>

      <section className="relative z-0 min-h-0 overflow-hidden">
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
