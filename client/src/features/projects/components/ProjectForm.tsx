import { useState, type FormEvent } from 'react';
import type { User } from '@/features/auth/types';
import { createProject } from '../api/createProject';
import type { ConfidentialityLevel } from '../types';
import { ProjectAssignmentFields } from './ProjectAssignmentFields';

interface ProjectFormProps {
  organizationId: string;
  actor: User;
  members: User[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectForm({
  organizationId,
  actor,
  members,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState('');
  const [confidentiality, setConfidentiality] = useState<'' | ConfidentialityLevel>('');
  const [leaderIds, setLeaderIds] = useState<string[]>(actor.role === 'LIDER' ? [actor.id] : []);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del proyecto es obligatorio.');
      return;
    }
    if (name.trim().length < 3) {
      setError('El nombre del proyecto debe tener al menos 3 caracteres.');
      return;
    }
    if (!confidentiality) {
      setError('El nivel de confidencialidad es obligatorio.');
      return;
    }
    if (actor.role === 'ORGANIZACION' && leaderIds.length === 0) {
      setError('Debes seleccionar al menos un Líder.');
      return;
    }

    setIsLoading(true);
    try {
      await createProject(organizationId, actor, {
        name,
        confidentiality,
        leaderIds,
        memberIds,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al crear el proyecto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900">Crear proyecto</h3>
        <p className="text-xs text-gray-500 mt-1">
          Define el nombre, el nivel de confidencialidad y los miembros que tendrán acceso a los procedimientos.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="projectName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Nombre del proyecto
          </label>
          <input
            id="projectName"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Auditoría de procesos"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="projectConfidentiality" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Nivel de confidencialidad
          </label>
          <select
            id="projectConfidentiality"
            value={confidentiality}
            onChange={(event) => setConfidentiality(event.target.value as '' | ConfidentialityLevel)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors cursor-pointer"
          >
            <option value="">Selecciona un nivel</option>
            <option value="PUBLIC">Público</option>
            <option value="PRIVATE">Privado</option>
          </select>
        </div>

        <ProjectAssignmentFields
          actor={actor}
          members={members}
          leaderIds={leaderIds}
          memberIds={memberIds}
          onChange={({ leaderIds: nextLeaders, memberIds: nextMembers }) => {
            setLeaderIds(nextLeaders);
            setMemberIds(nextMembers);
          }}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium text-sm rounded-md shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creando...' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}
