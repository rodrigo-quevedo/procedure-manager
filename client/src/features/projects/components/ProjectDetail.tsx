import { useState, type FormEvent } from 'react';
import type { User } from '@/features/auth/types';
import { updateProject } from '../api/updateProject';
import { CONFIDENTIALITY_LABELS, type ConfidentialityLevel, type Project } from '../types';
import { ProjectAssignmentFields } from './ProjectAssignmentFields';

interface ProjectDetailProps {
  project: Project;
  actor: User;
  members: User[];
  onUpdated: (project: Project) => void;
  onBack: () => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function ProjectDetail({
  project,
  actor,
  members,
  onUpdated,
  onBack,
}: ProjectDetailProps) {
  const [name, setName] = useState(project.name);
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>(project.confidentiality);
  const [leaderIds, setLeaderIds] = useState<string[]>(project.leaderIds);
  const [memberIds, setMemberIds] = useState<string[]>(project.memberIds);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

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
      const updated = await updateProject(project.id, actor, {
        name,
        confidentiality,
        leaderIds,
        memberIds,
      });
      setSuccessMessage('¡Proyecto actualizado exitosamente!');
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al actualizar el proyecto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
      <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la lista de proyectos
          </button>
          <h2 className="text-xl font-bold text-gray-900">Detalle del proyecto</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Edita el nombre, los miembros o el nivel de confidencialidad y presiona Guardar.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {CONFIDENTIALITY_LABELS[project.confidentiality]}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">Actualizado: {formatDate(project.updatedAt)}</p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-5 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="editProjectName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Nombre del proyecto
          </label>
          <input
            id="editProjectName"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="editProjectConfidentiality" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Nivel de confidencialidad
          </label>
          <select
            id="editProjectConfidentiality"
            value={confidentiality}
            onChange={(event) => setConfidentiality(event.target.value as ConfidentialityLevel)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors cursor-pointer"
          >
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium text-sm rounded-md shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
