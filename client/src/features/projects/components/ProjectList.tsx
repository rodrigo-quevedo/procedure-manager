import { useMemo, useState } from 'react';
import type { User } from '@/features/auth/types';
import { CONFIDENTIALITY_LABELS, type Project } from '../types';
import { projectMatchesQuery, projectParticipants } from '../utils/search';

interface ProjectListProps {
  projects: Project[];
  members: User[];
  isLoading?: boolean;
  onSelectProject: (project: Project) => void;
}

function namesFor(ids: string[], directory: User[]): string {
  const names = ids
    .map((id) => directory.find((person) => person.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  if (names.length === 0) return 'Sin asignar';
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

export function ProjectList({
  projects,
  members,
  isLoading = false,
  onSelectProject,
}: ProjectListProps) {
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        projectMatchesQuery(project, projectParticipants(project, members), search),
      ),
    [projects, members, search],
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-xs">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          {filteredProjects.length} de {projects.length} proyectos
        </p>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o correo electrónico..."
            aria-label="Buscar proyectos por nombre o correo electrónico"
            className="w-full sm:w-72 pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Proyecto</th>
              <th className="px-6 py-3">Confidencialidad</th>
              <th className="px-6 py-3">Líderes</th>
              <th className="px-6 py-3">Miembros</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400">
                  Cargando proyectos...
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400">
                  {search.trim()
                    ? 'Ningún proyecto coincide con la búsqueda.'
                    : 'Todavía no hay proyectos para mostrar.'}
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/75 transition-colors">
                  <td onClick={() => onSelectProject(project)} className="px-6 py-4 cursor-pointer">
                    <span className="font-semibold text-gray-900 hover:text-red-600 transition-colors">
                      {project.name}
                    </span>
                  </td>
                  <td onClick={() => onSelectProject(project)} className="px-6 py-4 cursor-pointer">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        project.confidentiality === 'PRIVATE'
                          ? 'bg-gray-100 text-gray-700 border border-gray-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {CONFIDENTIALITY_LABELS[project.confidentiality]}
                    </span>
                  </td>
                  <td onClick={() => onSelectProject(project)} className="px-6 py-4 cursor-pointer text-xs text-gray-700">
                    {namesFor(project.leaderIds, members)}
                  </td>
                  <td onClick={() => onSelectProject(project)} className="px-6 py-4 cursor-pointer text-xs text-gray-700">
                    {namesFor(project.memberIds, members)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
