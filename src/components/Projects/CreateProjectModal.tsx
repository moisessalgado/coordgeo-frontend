import { useState } from 'react'
import { ProjectForm } from './ProjectForm.tsx'
import { geodataService } from '../../services/geodata.ts'
import { getUserFacingApiError } from '../../services/apiErrors.ts'
import { useMapStore } from '../../state/mapStore.ts'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchMapData = useMapStore((state) => state.fetchMapData)
  const projects = useMapStore((state) => state.projects)

  if (!isOpen) return null

  // Generate suggested name based on existing projects
  const suggestedName = `Project ${projects.length + 1}`

  const handleSubmit = async (data: { name: string; description: string }) => {
    setError(null)
    setIsLoading(true)

    try {
      await geodataService.createProject(data)
      
      // Refresh map data
      await fetchMapData()
      
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(
        getUserFacingApiError(err, {
          context: 'map',
          fallbackMessage: 'Não foi possível criar o projeto. Tente novamente.',
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isLoading) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="mb-1 text-xl font-semibold text-slate-900">Novo projeto</h2>
        <p className="mb-6 text-sm text-slate-600">
          Crie um projeto para organizar suas camadas e dados.
        </p>
        
        <ProjectForm
          isLoading={isLoading}
          error={error}
          suggestedName={suggestedName}
          onSubmit={handleSubmit}
          onCancel={isLoading ? undefined : onClose}
        />
      </div>
    </div>
  )
}
