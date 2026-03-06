import { useEffect, useMemo, useState } from 'react'
import { Footer } from '../components/Footer.tsx'
import { Navbar } from '../components/Navbar.tsx'
import { getUserFacingApiError } from '../services/apiErrors.ts'
import { geodataService } from '../services/geodata.ts'
import { useMapStore } from '../state/mapStore.ts'
import { useOrgStore } from '../state/orgStore.ts'

type SettingsTab = 'projects' | 'layers' | 'datasources'

const tabLabels: Record<SettingsTab, string> = {
  projects: 'Projetos',
  layers: 'Camadas',
  datasources: 'Datasources',
}

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '-'
  }

  return parsed.toLocaleDateString('pt-BR')
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('projects')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingProjectName, setEditingProjectName] = useState('')
  const [editingProjectDescription, setEditingProjectDescription] = useState('')
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingLayerName, setEditingLayerName] = useState('')
  const [editingLayerDescription, setEditingLayerDescription] = useState('')
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const projects = useMapStore((state) => state.projects)
  const layers = useMapStore((state) => state.layers)
  const datasources = useMapStore((state) => state.datasources)
  const fetchMapData = useMapStore((state) => state.fetchMapData)
  const isLoading = useMapStore((state) => state.isLoading)
  const error = useMapStore((state) => state.error)

  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const organizations = useOrgStore((state) => state.organizations)

  const activeOrgName = useMemo(
    () => organizations.find((organization) => organization.id === activeOrgId)?.name ?? 'Organização ativa',
    [activeOrgId, organizations],
  )

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  )

  const refreshData = async () => {
    await fetchMapData()
  }

  const startProjectEdit = (projectId: string) => {
    const project = projects.find((entry) => entry.id === projectId)
    if (!project) {
      return
    }

    setActionError(null)
    setEditingProjectId(projectId)
    setEditingProjectName(project.name)
    setEditingProjectDescription(project.description)
  }

  const saveProjectEdit = async () => {
    if (!editingProjectId) {
      return
    }

    setActionError(null)
    setActionLoadingKey(`project-save-${editingProjectId}`)

    try {
      await geodataService.updateProject(editingProjectId, {
        name: editingProjectName,
        description: editingProjectDescription,
      })
      await refreshData()
      setEditingProjectId(null)
    } catch (error) {
      setActionError(
        getUserFacingApiError(error, {
          context: 'map',
          fallbackMessage: 'Não foi possível atualizar o projeto.',
        }),
      )
    } finally {
      setActionLoadingKey(null)
    }
  }

  const deleteProject = async (projectId: string) => {
    const project = projectsById.get(projectId)
    if (!project) {
      return
    }

    const confirmed = window.confirm(`Excluir o projeto "${project.name}"? Esta ação não pode ser desfeita.`)
    if (!confirmed) {
      return
    }

    setActionError(null)
    setActionLoadingKey(`project-delete-${projectId}`)

    try {
      await geodataService.deleteProject(projectId)
      await refreshData()
      if (editingProjectId === projectId) {
        setEditingProjectId(null)
      }
    } catch (error) {
      setActionError(
        getUserFacingApiError(error, {
          context: 'map',
          fallbackMessage: 'Não foi possível excluir o projeto.',
        }),
      )
    } finally {
      setActionLoadingKey(null)
    }
  }

  const startLayerEdit = (layerId: string) => {
    const layer = layers.find((entry) => entry.id === layerId)
    if (!layer) {
      return
    }

    setActionError(null)
    setEditingLayerId(layerId)
    setEditingLayerName(layer.name)
    setEditingLayerDescription(layer.description)
  }

  const saveLayerEdit = async () => {
    if (!editingLayerId) {
      return
    }

    setActionError(null)
    setActionLoadingKey(`layer-save-${editingLayerId}`)

    try {
      await geodataService.updateLayer(editingLayerId, {
        name: editingLayerName,
        description: editingLayerDescription,
      })
      await refreshData()
      setEditingLayerId(null)
    } catch (error) {
      setActionError(
        getUserFacingApiError(error, {
          context: 'map',
          fallbackMessage: 'Não foi possível atualizar a camada.',
        }),
      )
    } finally {
      setActionLoadingKey(null)
    }
  }

  const deleteLayer = async (layerId: string) => {
    const layer = layers.find((entry) => entry.id === layerId)
    if (!layer) {
      return
    }

    const confirmed = window.confirm(`Excluir a camada "${layer.name}"? Esta ação não pode ser desfeita.`)
    if (!confirmed) {
      return
    }

    setActionError(null)
    setActionLoadingKey(`layer-delete-${layerId}`)

    try {
      await geodataService.deleteLayer(layerId)
      await refreshData()
      if (editingLayerId === layerId) {
        setEditingLayerId(null)
      }
    } catch (error) {
      setActionError(
        getUserFacingApiError(error, {
          context: 'map',
          fallbackMessage: 'Não foi possível excluir a camada.',
        }),
      )
    } finally {
      setActionLoadingKey(null)
    }
  }

  const toggleDatasourcePublic = async (datasourceId: string, nextValue: boolean) => {
    setActionError(null)
    setActionLoadingKey(`datasource-visibility-${datasourceId}`)

    try {
      await geodataService.updateDatasource(datasourceId, { is_public: nextValue })
      await refreshData()
    } catch (error) {
      setActionError(
        getUserFacingApiError(error, {
          context: 'map',
          fallbackMessage: 'Não foi possível atualizar a visibilidade do datasource.',
        }),
      )
    } finally {
      setActionLoadingKey(null)
    }
  }

  const deleteDatasource = async (datasourceId: string, datasourceName: string) => {
    const confirmed = window.confirm(`Excluir o datasource "${datasourceName}"? Esta ação não pode ser desfeita.`)
    if (!confirmed) {
      return
    }

    setActionError(null)
    setActionLoadingKey(`datasource-delete-${datasourceId}`)

    try {
      await geodataService.deleteDatasource(datasourceId)
      await refreshData()
    } catch (error) {
      setActionError(
        getUserFacingApiError(error, {
          context: 'map',
          fallbackMessage: 'Não foi possível excluir o datasource.',
        }),
      )
    } finally {
      setActionLoadingKey(null)
    }
  }

  useEffect(() => {
    if (projects.length || layers.length || datasources.length) {
      return
    }

    void fetchMapData()
  }, [datasources.length, fetchMapData, layers.length, projects.length])

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Configurações</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Gestão de dados</h1>
          <p className="mt-2 text-sm text-slate-600">
            Organize seus dados da organização <span className="font-semibold text-slate-900">{activeOrgName}</span>.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Projetos</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{projects.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Camadas</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{layers.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Datasources</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{datasources.length}</p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(tabLabels) as SettingsTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {isLoading ? <p className="mt-4 text-sm text-slate-600">Carregando dados...</p> : null}
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          {actionError ? <p className="mt-4 text-sm text-red-600">{actionError}</p> : null}

          <div className="mt-4 space-y-3">
            {activeTab === 'projects'
              ? projects.map((project) => (
                  <article key={project.id} className="rounded-xl border border-slate-200 p-4">
                    {editingProjectId === project.id ? (
                      <div className="space-y-3">
                        <input
                          value={editingProjectName}
                          onChange={(event) => setEditingProjectName(event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                          placeholder="Nome do projeto"
                        />
                        <textarea
                          value={editingProjectDescription}
                          onChange={(event) => setEditingProjectDescription(event.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                          placeholder="Descrição"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProjectId(null)}
                            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void saveProjectEdit()
                            }}
                            disabled={actionLoadingKey === `project-save-${project.id}` || !editingProjectName.trim()}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingKey === `project-save-${project.id}` ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">{project.name}</h2>
                          <p className="mt-1 text-xs text-slate-500">{project.description || 'Sem descrição'}</p>
                          <p className="mt-2 text-xs text-slate-500">Criado em {formatDate(project.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startProjectEdit(project.id)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void deleteProject(project.id)
                            }}
                            disabled={actionLoadingKey === `project-delete-${project.id}`}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingKey === `project-delete-${project.id}` ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              : null}

            {activeTab === 'layers'
              ? layers.map((layer) => (
                  <article key={layer.id} className="rounded-xl border border-slate-200 p-4">
                    {editingLayerId === layer.id ? (
                      <div className="space-y-3">
                        <input
                          value={editingLayerName}
                          onChange={(event) => setEditingLayerName(event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                          placeholder="Nome da camada"
                        />
                        <textarea
                          value={editingLayerDescription}
                          onChange={(event) => setEditingLayerDescription(event.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                          placeholder="Descrição"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLayerId(null)}
                            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void saveLayerEdit()
                            }}
                            disabled={actionLoadingKey === `layer-save-${layer.id}` || !editingLayerName.trim()}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingKey === `layer-save-${layer.id}` ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">{layer.name}</h2>
                          <p className="mt-1 text-xs text-slate-500">
                            Projeto {projectsById.get(layer.project_id)?.name ?? layer.project_id}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{layer.description || 'Sem descrição'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            z-index {layer.z_index}
                          </span>
                          <button
                            type="button"
                            onClick={() => startLayerEdit(layer.id)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void deleteLayer(layer.id)
                            }}
                            disabled={actionLoadingKey === `layer-delete-${layer.id}`}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingKey === `layer-delete-${layer.id}` ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              : null}

            {activeTab === 'datasources'
              ? datasources.map((datasource) => (
                  <article key={datasource.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900">{datasource.name}</h2>
                        <p className="mt-1 text-xs text-slate-500">{datasource.description || 'Sem descrição'}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Usado por {layers.filter((layer) => layer.datasource_id === datasource.id).length} camada(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase text-slate-700">
                          {datasource.datasource_type}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void toggleDatasourcePublic(datasource.id, !datasource.is_public)
                          }}
                          disabled={actionLoadingKey === `datasource-visibility-${datasource.id}`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoadingKey === `datasource-visibility-${datasource.id}`
                            ? 'Atualizando...'
                            : datasource.is_public
                              ? 'Tornar privado'
                              : 'Tornar público'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void deleteDatasource(datasource.id, datasource.name)
                          }}
                          disabled={actionLoadingKey === `datasource-delete-${datasource.id}`}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoadingKey === `datasource-delete-${datasource.id}` ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              : null}

            {!isLoading && activeTab === 'projects' && projects.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhum projeto disponível.</p>
            ) : null}
            {!isLoading && activeTab === 'layers' && layers.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhuma camada disponível.</p>
            ) : null}
            {!isLoading && activeTab === 'datasources' && datasources.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhum datasource disponível.</p>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
