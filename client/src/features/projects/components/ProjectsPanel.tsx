import { useCallback, useEffect, useState } from 'react';
import type { MemberResponse } from '@pm/shared';
import { getMembers } from '@/features/members';
import { getProjects } from '../api/getProjects';
import type { ClientProject as Project } from '../types';
import { ProjectDetail } from './ProjectDetail';
import { ProjectForm } from './ProjectForm';
import { ProjectList } from './ProjectList';

interface ProjectsPanelProps {
  organizationId?: string | number;
  actor: { id: number; role: string; fullName?: string; name?: string; email: string };
  onSuccess: (message: string) => void;
  createTrigger?: number;
}

type PanelView = 'list' | 'create' | 'detail';

export function ProjectsPanel({ organizationId, actor, onSuccess, createTrigger }: ProjectsPanelProps) {
  const [view, setView] = useState<PanelView>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (createTrigger && createTrigger > 0) {
      setSelectedProject(null);
      setView('create');
    }
  }, [createTrigger]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectData, memberData] = await Promise.all([
        getProjects(organizationId),
        getMembers(),
      ]);
      setProjects(projectData);
      setMembers(memberData);
    } catch (err) {
      console.error('Error al cargar datos de proyectos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOrg = actor.role === 'ORGANIZATION' || actor.role === 'ORGANIZACION';

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
                {isOrg
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
