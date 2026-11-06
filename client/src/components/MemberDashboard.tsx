import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';
import type { Organization, User } from '@/features/auth/types';
import { getMembers } from '@/features/members';
import { getProjects, ProjectsPanel, type Project } from '@/features/projects';

interface MemberDashboardProps {
  user: User;
  organization: Organization | null;
  onLogout: () => void;
}

type LeaderTab = 'PROJECTS' | 'OVERVIEW';

function leaderNames(project: Project, directory: User[]): string {
  const names = project.leaderIds
    .map((id) => directory.find((person) => person.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return names.length > 0 ? names.join(', ') : 'Sin asignar';
}

export const MemberDashboard = ({
  user,
  organization,
  onLogout,
}: MemberDashboardProps) => {
  const [activeTab, setActiveTab] = useState<LeaderTab>('PROJECTS');
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (user.role !== 'DESARROLLADOR' || !organization) return;

    let cancelled = false;
    setIsLoadingProjects(true);

    Promise.all([getProjects(organization.id, user), getMembers(organization.id)])
      .then(([projectData, memberData]) => {
        if (cancelled) return;
        setAssignedProjects(projectData);
        setMembers(memberData);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProjects(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, organization]);

  const handleLogout = () => {
    storage.clearSession();
    onLogout();
  };

  const showSuccessFeedback = (message: string) => {
    setGlobalSuccess(message);
    window.setTimeout(() => {
      setGlobalSuccess(null);
    }, 3500);
  };

  const roleLabel = user.role === 'LIDER' ? 'Líder' : 'Desarrollador';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              PM
            </div>
            <span className="font-semibold text-gray-900 text-sm tracking-tight">
              {organization?.name || 'Procedure Manager'}
            </span>
          </div>

          {user.role === 'LIDER' && (
            <nav className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('PROJECTS')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'PROJECTS'
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Proyectos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Resumen
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-medium text-gray-900">{user.email}</p>
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-700">
              {roleLabel}
            </span>
          </div>

          <button
            onClick={handleLogout}
            type="button"
            className="text-xs font-medium text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-md bg-white hover:bg-red-50 transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {globalSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-3 shadow-xs">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{globalSuccess}</span>
          </div>
        )}

        {user.role === 'LIDER' && activeTab === 'PROJECTS' && organization && (
          <ProjectsPanel
            organizationId={organization.id}
            actor={user}
            onSuccess={showSuccessFeedback}
          />
        )}

        {(user.role !== 'LIDER' || activeTab === 'OVERVIEW') && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-xs">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {roleLabel} dashboard
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Bienvenido, <span className="font-medium text-gray-700">{user.name}</span>.
              {user.role === 'LIDER'
                ? ' Desde Proyectos puedes crear y editar los proyectos en los que participas.'
                : ' Aquí puedes ver los proyectos en los que participas y quiénes son sus líderes.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-xs uppercase font-semibold text-gray-500">
                  Organización
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {organization?.name || 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-xs uppercase font-semibold text-gray-500">
                  Mi Nombre
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">{user.name}</p>
                <p className="text-xs text-gray-400 mt-1">{user.email}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-xs uppercase font-semibold text-gray-500">
                  Mi Rol
                </span>
                <p className="text-lg font-bold text-red-600 mt-1">{roleLabel}</p>
                <p className="text-xs text-gray-400 mt-1">Estado: Habilitado</p>
              </div>
            </div>
          </div>
        )}

        {user.role === 'DESARROLLADOR' && organization && (
          <section className="mt-6 bg-white rounded-lg border border-gray-200 shadow-xs">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Mis proyectos</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Proyectos en los que participas actualmente.
              </p>
            </div>

            {isLoadingProjects ? (
              <p className="px-6 py-8 text-center text-xs text-gray-400">Cargando proyectos...</p>
            ) : assignedProjects.length === 0 ? (
              <p className="px-6 py-8 text-center text-xs text-gray-400">
                No participas en ningún proyecto.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {assignedProjects.map((project) => (
                  <li
                    key={project.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                  >
                    <span className="text-sm font-semibold text-gray-900">{project.name}</span>
                    <span className="text-xs text-gray-600">
                      <span className="font-medium text-gray-500">Líderes: </span>
                      {leaderNames(project, members)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
