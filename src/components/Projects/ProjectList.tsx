import type { Project } from '../../types/geospatial.ts'
import { ActionButton } from '../UI/ActionButton.tsx'
import { SectionHeader } from '../UI/SectionHeader.tsx'

interface ProjectListProps {
  projects: Project[]
  onCreateClick: () => void
  onZoomToProject?: (project: Project) => void
}

export function ProjectList({ projects, onCreateClick, onZoomToProject }: ProjectListProps) {
  return (
    <section className="sidebar-card space-y-3">
      <SectionHeader
        title="Projetos"
        subtitle="Gerencie seus projetos geoespaciais"
        action={<ActionButton label="Novo projeto" icon="+" variant="primary" onClick={onCreateClick} />}
      />

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">
            Nenhum projeto criado ainda.
          </p>
          <div className="mt-3">
            <ActionButton label="Criar primeiro projeto" variant="secondary" onClick={onCreateClick} />
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900">{project.name}</h4>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2">{project.description}</p>
              </div>
              {onZoomToProject && project.geometry && (
                <ActionButton
                  label={`Zoom no projeto ${project.name}`}
                  icon="🔍"
                  variant="subtle"
                  compact
                  className="shrink-0 text-blue-700 hover:bg-blue-50"
                  onClick={() => onZoomToProject(project)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
