import { useEffect, useState, useCallback } from 'react';
import type { Organization, User } from '@/features/auth/types';
import { getMembers } from '@/features/members';
import { getProjects, type ClientProject as Project } from '@/features/projects';
import {
  getProcedures,
  getProcedureDetails,
  ProcedureManagementPanel,
  CreateProcedureModal,
  CreationAndExecutionView,
} from '@/features/procedures';
import type { Procedure, Execution } from '@shared/types';
import {
  getExecutions,
  getExecutionDetails,
  ExecutionManagementPanel,
  type ExecutionListItem,
} from '@/features/procedure_executions';
import { NavbarHeader } from '@/components/NavbarHeader';
import { SidebarNav, SidebarNavItem } from '@/components/SidebarNav';
import { PlaySquare, BookOpen, Plus } from 'lucide-react';

interface DeveloperDashboardProps {
  user: User;
  organization: Organization | null;
  onLogout: () => void;
}

type DeveloperTab = 'EXECUTIONS' | 'PROCEDURES';

export const DeveloperDashboard = ({
  user,
  organization,
  onLogout,
}: DeveloperDashboardProps) => {
  const [activeTab, setActiveTab] = useState<DeveloperTab>('EXECUTIONS');
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [, setMembers] = useState<User[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [executions, setExecutions] = useState<ExecutionListItem[]>([]);
  const [, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Creation and Execution Full Screen State (HU-007 / HU-009 / HU-011)
  const [executionSession, setExecutionSession] = useState<{
    isOpen: boolean;
    mode: 'CREATION_AND_EXECUTION' | 'EXECUTE_EXISTING';
    procedure?: Procedure | null;
    execution?: Execution | null;
    steps?: any[];
    inputs?: any[];
  } | null>(null);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const devId = Number(user.id) || 1;
      const [projectData, memberData, procData, execData] = await Promise.all([
        getProjects(),
        getMembers(),
        getProcedures(),
        getExecutions(devId),
      ]);
      setAssignedProjects(projectData);
      setMembers(memberData);
      setProcedures(procData);
      setExecutions(execData);
    } catch (err) {
      console.error('Error cargando datos del desarrollador:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleLogout = () => {
    localStorage.removeItem('pm_auth_session');
    onLogout();
  };

  const showSuccessFeedback = (message: string) => {
    setGlobalSuccess(message);
    window.setTimeout(() => {
      setGlobalSuccess(null);
    }, 4000);
  };

  // Launch New Procedure Creation & Execution (HU-007)
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreateProcedure = (data: {
    name: string;
    projectId: number;
    tags: string[];
  }) => {
    setIsCreateModalOpen(false);
    setExecutionSession({
      isOpen: true,
      mode: 'CREATION_AND_EXECUTION',
      procedure: {
        id: 0,
        idProject: data.projectId,
        idCreator: Number(user.id),
        state: 'DRAFT',
        name: data.name,
        description: '',
        createdAt: new Date().toISOString(),
        tags: data.tags,
      },
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

  const pageTitle =
    activeTab === 'EXECUTIONS' ? 'Gestión de Ejecuciones' : 'Biblioteca de Procedimientos Estándar';

  const pendingExecutionsCount = executions.filter(
    (e) => e.state === 'HAS_CORRECTIONS' || e.state === 'PAUSED'
  ).length;

  const sidebarItems: SidebarNavItem<DeveloperTab>[] = [
    {
      id: 'EXECUTIONS',
      label: 'Ejecuciones',
      icon: <PlaySquare className="w-4 h-4" />,
      badge: pendingExecutionsCount > 0 ? pendingExecutionsCount : undefined,
    },
    {
      id: 'PROCEDURES',
      label: 'Procedimientos Estándar',
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50/50">
      <NavbarHeader
        user={user}
        organization={organization}
        pageTitle={pageTitle}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full px-4 sm:px-6 py-6">
        {globalSuccess && (
          <div className="max-w-5xl mx-auto mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-3 shadow-xs">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{globalSuccess}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-5 items-start w-full">
          {/* Side Navbar de Desarrollador pegado a la izquierda */}
          <SidebarNav<DeveloperTab>
            items={sidebarItems}
            activeId={activeTab}
            onSelect={(tab) => setActiveTab(tab)}
            actionButton={{
              label: 'Crear Procedimiento',
              icon: <Plus className="w-3.5 h-3.5 stroke-[2.5]" />,
              onClick: handleOpenCreateModal,
            }}
          />

          {/* Contenido centrado */}
          <div className="flex-1 w-full min-w-0 flex justify-center">
            <div className="w-full max-w-5xl space-y-6">
              {/* Executions Management Tab (HU-011) */}
              {activeTab === 'EXECUTIONS' && (
                <div className="w-full">
                  <ExecutionManagementPanel
                    executions={executions}
                    onRefresh={loadAllData}
                    onResumeExecution={handleResumeExecution}
                    onSuccessFeedback={showSuccessFeedback}
                    onCreateAndExecute={handleOpenCreateModal}
                    onSearchProcedures={() => setActiveTab('PROCEDURES')}
                  />
                </div>
              )}

              {/* Procedures Management Tab (HU-008 & Entry to HU-007 / HU-009) */}
              {activeTab === 'PROCEDURES' && (
                <div className="w-full">
                  <ProcedureManagementPanel
                    procedures={procedures}
                    onExecuteProcedure={handleExecuteProcedure}
                    onNewProcedure={handleOpenCreateModal}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal para Crear Procedimiento */}
      <CreateProcedureModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleConfirmCreateProcedure}
      />
    </div>
  );
};
