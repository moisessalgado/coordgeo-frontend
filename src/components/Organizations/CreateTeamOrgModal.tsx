import { useState } from 'react'
import type { AxiosError } from 'axios'
import { createTeamOrganization } from '../../services/organizations.ts'

interface CreateTeamOrgModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (orgId: string, orgName: string) => void
}

export function CreateTeamOrgModal({ isOpen, onClose, onSuccess }: CreateTeamOrgModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    // Auto-generate slug from name
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nome da organização é obrigatório')
      return
    }

    if (!slug.trim()) {
      setError('Slug é obrigatório')
      return
    }

    setIsCreating(true)

    try {
      const org = await createTeamOrganization(name, slug, description)
      setName('')
      setSlug('')
      setDescription('')
      onSuccess(org.id, org.name)
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>
      const detail = axiosError.response?.data?.detail
      setError(detail || 'Erro ao criar organização em equipe')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Criar Organização em Equipe
        </h2>
        <p className="mb-6 text-slate-600">
          Crie uma nova organização para colaboração em equipe com seu plano PRO
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nome da Organização *
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Ex: Equipe de Cartografia"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex: equipe-cartografia"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isCreating}
            />
            <p className="mt-1 text-xs text-slate-500">
              URL-safe identifier (apenas letras, números, hífen)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Organização para projetos de mapeamento colaborativo..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              disabled={isCreating}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {isCreating ? 'Criando...' : 'Criar Organização'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
