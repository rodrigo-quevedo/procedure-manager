import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/features/auth/types';
import { getMembers } from '@/features/members';
import { getProjects } from '../api/getProjects';
import type { Project } from '../types';
import { ProjectDetail } from './ProjectDetail';
import { ProjectForm } from './ProjectForm';
import { ProjectList } from './ProjectList';

interface ProjectsPanelProps {
  organizationId: string;
  actor: User;
  onSuccess: (message: string) => void;
}

type PanelView = 'list' | 'create' | 'detail';

export function ProjectsPanel({ organizationId, actor, onSuccess }: ProjectsPanelProps) {
  const [view, setView] = useState<PanelView>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectData, memberData] = await Promise.all([
        getProjects(organizationId, actor),
        getMembers(organizationId),
      ]);
      setProjects(projectData);
      setMembers(memberData);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, actor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {view === 'detail' && selectedProject ? (
        <ProjectDetail
          key={selectedProject.id}
          project={selectedProject}
          actor={actor}
          members={members}
          onBack={() => {
            setSelectedProject(null);
            setView('list');
          }}
          onUpdated={(updated) => {
            setProjects((current) => current.map((project) => (project.id === updated.id ? updated : project)));
            setSelectedProject(updated);
            onSuccess('¡Proyecto actualizado exitosamente!');
          }}
        />
      ) : view === 'create' ? (
        <ProjectForm
          organizationId={organizationId}
          actor={actor}
          members={members}
          onCancel={() => setView('list')}
          onSuccess={() => {
            loadData();
            setView('list');
            onSuccess('¡Proyecto creado exitosamente!');
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Proyectos</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {actor.role === 'ORGANIZACION'
                  ? 'Listado de todos los proyectos de la organización.'
                  : 'Listado de los proyectos en los que estás asignado.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView('create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo proyecto
            </button>
          </div>

          <ProjectList
            projects={projects}
            members={members}
            isLoading={isLoading}
            onSelectProject={(project) => {
              setSelectedProject(project);
              setView('detail');
            }}
          />
        </div>
      )}
    </div>
  );
}
