import type { Project } from '../../types/geospatial.ts'

interface ProjectListProps {
  projects: Project[]
  onCreateClick: () => void
}

export function ProjectList({ projects, onCreateClick }: ProjectListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Projetos</h3>
        <button
          onClick={onCreateClick}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          + Novo
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">
          <p className="text-sm text-slate-600">
            Nenhum projeto criado ainda.
          </p>
          <button
            onClick={onCreateClick}
            className="mt-2 text-sm font-medium text-slate-900 hover:underline"
          >
            Criar primeiro projeto
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300"
            >
              <h4 className="text-sm font-medium text-slate-900">{project.name}</h4>
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">{project.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
