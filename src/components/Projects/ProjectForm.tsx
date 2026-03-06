import { useState, type FormEvent } from 'react'

interface ProjectFormProps {
  isLoading: boolean
  error: string | null
  suggestedName?: string
  onSubmit: (data: { name: string; description: string }) => Promise<void>
  onCancel?: () => void
}

export function ProjectForm({ isLoading, error, suggestedName = '', onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(suggestedName)
  const [description, setDescription] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit({ name, description })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="project-name" className="block text-sm font-medium text-slate-700">
          Nome do projeto
        </label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          disabled={isLoading}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="project-description" className="block text-sm font-medium text-slate-700">
          Descrição <span className="text-slate-500">(opcional)</span>
        </label>
        <textarea
          id="project-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isLoading}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
          placeholder="Descreva o projeto..."
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isLoading ? 'Criando...' : 'Criar projeto'}
        </button>
      </div>
    </form>
  )
}
