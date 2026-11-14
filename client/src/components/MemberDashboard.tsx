import { useEffect, useState, useCallback } from 'react';
import { storage } from '@/services/storage';
import { initializeProcedureMocks } from '@/services/mockSeed';
import type { Organization, User } from '@/features/auth/types';
import { getMembers } from '@/features/members';
import { getProjects, ProjectsPanel, type ClientProject as Project } from '@/features/projects';
import {
  getProcedures,
  getProcedureDetails,
  ProcedureManagementPanel,
  CreationAndExecutionView,
} from '@/features/procedures';
import type { Procedure, Execution } from '@shared/types';
import {
  getExecutions,
  getExecutionDetails,
  ExecutionManagementPanel,
  type ExecutionListItem,
} from '@/features/procedure_executions';

interface MemberDashboardProps {
  user: User;
  organization: Organization | null;
  onLogout: () => void;
}

type MemberTab = 'OVERVIEW' | 'PROJECTS' | 'PROCEDURES' | 'EXECUTIONS';

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
  const [activeTab, setActiveTab] = useState<MemberTab>(
    user.role === 'LIDER' ? 'PROJECTS' : 'EXECUTIONS'
  );
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [executions, setExecutions] = useState<ExecutionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Creation and Execution Full Screen State (HU-007 / HU-009 / HU-011)
  const [executionSession, setExecutionSession] = useState<{
    isOpen: boolean;
    mode: 'CREATION_AND_EXECUTION' | 'EXECUTE_EXISTING';
    procedure?: Procedure | null;
    execution?: Execution | null;
    steps?: any[];
    inputs?: any[];
  } | null>(null);

  // Initialize mocks when entering dashboard
  useEffect(() => {
    if (!organization) return;
    const orgId = organization.id;
    const devId = Number(user.id) || 1;
    const projId = assignedProjects.length > 0 ? Number(assignedProjects[0].id) : 1;
    initializeProcedureMocks(orgId, devId, projId);
  }, [organization, user.id, assignedProjects]);

  const loadAllData = useCallback(async () => {
    if (!organization) return;
    setIsLoading(true);
    try {
      const devId = Number(user.id) || 1;
      const [projectData, memberData, procData, execData] = await Promise.all([
        getProjects(organization.id, user),
        getMembers(organization.id),
        getProcedures(),
        getExecutions(devId),
      ]);
      setAssignedProjects(projectData);
      setMembers(memberData);
      setProcedures(procData);
      setExecutions(execData);
    } finally {
      setIsLoading(false);
    }
  }, [organization, user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleLogout = () => {
    storage.clearSession();
    onLogout();
  };

  const showSuccessFeedback = (message: string) => {
    setGlobalSuccess(message);
    window.setTimeout(() => {
      setGlobalSuccess(null);
    }, 4000);
  };

  // Launch New Procedure Creation & Execution (HU-007)
  const handleStartCreationAndExecution = () => {
    setExecutionSession({
      isOpen: true,
      mode: 'CREATION_AND_EXECUTION',
      procedure: null,
      execution: null,
    });
  };

  // Launch Existing Procedure Execution (HU-009)
  const handleExecuteProcedure = async (procedureId: number) => {
    const details = await getProcedureDetails(procedureId);
    if (!details) return;

    setExecutionSession({
      isOpen: true,
      mode: 'EXECUTE_EXISTING',
      procedure: details,
      steps: details.steps,
      execution: null,
      inputs: [],
    });
  };

  // Resume Execution (HU-011 CA 4)
  const handleResumeExecution = async (executionId: number) => {
    const details = await getExecutionDetails(executionId);
    if (!details) return;

    const procDetails = await getProcedureDetails(details.idProcedure);

    setExecutionSession({
      isOpen: true,
      mode: 'EXECUTE_EXISTING',
      procedure: procDetails,
      execution: details,
      steps: procDetails?.steps || [],
      inputs: details.inputs,
    });
  };

  const roleLabel = user.role === 'LIDER' ? 'Líder' : 'Desarrollador';

  // If inside the Creation & Execution screen, show it full-bleed
  if (executionSession?.isOpen) {
    return (
      <CreationAndExecutionView
        currentUser={user}
        projects={assignedProjects}
        initialProcedure={executionSession.procedure}
        initialExecution={executionSession.execution}
        initialSteps={executionSession.steps}
        initialInputs={executionSession.inputs}
        mode={executionSession.mode}
        onBack={() => {
          setExecutionSession(null);
          loadAllData();
        }}
        onSuccessFeedback={(msg) => {
          showSuccessFeedback(msg);
          loadAllData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
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

          <nav className="flex flex-wrap items-center gap-1">
            {user.role === 'LIDER' && (
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
            )}

            <button
              type="button"
              onClick={() => setActiveTab('PROCEDURES')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'PROCEDURES'
                  ? 'bg-red-50 text-red-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Procedimientos
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('EXECUTIONS')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'EXECUTIONS'
                  ? 'bg-red-50 text-red-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Mis Ejecuciones
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

        {/* Procedures Management Tab (HU-008 & Entry to HU-007 / HU-009) */}
        {activeTab === 'PROCEDURES' && (
          <ProcedureManagementPanel
            procedures={procedures}
            onExecuteProcedure={handleExecuteProcedure}
            onNewProcedure={handleStartCreationAndExecution}
          />
        )}

        {/* Executions Management Tab (HU-011) */}
        {activeTab === 'EXECUTIONS' && (
          <ExecutionManagementPanel
            executions={executions}
            onRefresh={loadAllData}
            onResumeExecution={handleResumeExecution}
            onSuccessFeedback={showSuccessFeedback}
          />
        )}

        {/* Projects Tab for Leader */}
        {activeTab === 'PROJECTS' && user.role === 'LIDER' && organization && (
          <ProjectsPanel
            organizationId={organization.id}
            actor={user}
            onSuccess={showSuccessFeedback}
          />
        )}

        {/* Overview Tab */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-xs">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Panel de {roleLabel}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Bienvenido, <span className="font-medium text-gray-700">{user.name}</span>.
                Gestiona tus procedimientos, ejecuciones simultáneas y proyectos asignados.
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
                    Procedimientos Disponibles
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{procedures.length}</p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-xs uppercase font-semibold text-gray-500">
                    Mis Ejecuciones
                  </span>
                  <p className="text-lg font-bold text-red-600 mt-1">{executions.length}</p>
                </div>
              </div>
            </div>

            {/* My Projects */}
            <section className="bg-white rounded-lg border border-gray-200 shadow-xs">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Mis proyectos</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Proyectos en los que participas actualmente.
                </p>
              </div>

              {isLoading ? (
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
          </div>
        )}
      </main>
    </div>
  );
};
