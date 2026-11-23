import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/services/storage';
import type { Organization, User } from '@/features/auth/types';
import {
  MemberList,
  MemberForm,
  MemberDetail,
  ConfirmationModal,
  getMembers,
  toggleMemberStatus,
} from '@/features/members';
import { ProjectsPanel } from '@/features/projects';
import { NavbarHeader } from '@/components/NavbarHeader';
import { SidebarNav, SidebarNavItem } from '@/components/SidebarNav';
import { FolderKanban, Users, Plus } from 'lucide-react';

interface OrganizationDashboardProps {
  user: User;
  organization: Organization | null;
  onLogout: () => void;
}

type TabType = 'PROJECTS' | 'MEMBERS';

export const OrganizationDashboard = ({
  user,
  organization,
  onLogout,
}: OrganizationDashboardProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('PROJECTS');
  const [members, setMembers] = useState<User[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [projectCreateTrigger, setProjectCreateTrigger] = useState(0);

  // Confirmation modal state for enable/disable member
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    member: User | null;
    action: 'ENABLE' | 'DISABLE';
  }>({
    isOpen: false,
    member: null,
    action: 'DISABLE',
  });
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Global notification banner for success feedback
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const showSuccessFeedback = (message: string) => {
    setGlobalSuccess(message);
    setTimeout(() => {
      setGlobalSuccess(null);
    }, 3500);
  };

  const loadMembers = useCallback(async () => {
    if (!organization) return;
    setIsLoadingMembers(true);
    try {
      const data = await getMembers(organization.id);
      setMembers(data);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [organization]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleLogout = () => {
    storage.clearSession();
    onLogout();
  };

  // Trigger modal when clicking Habilitar / Inhabilitar
  const handleOpenStatusModal = (targetMember: User) => {
    setConfirmModal({
      isOpen: true,
      member: targetMember,
      action: targetMember.isActive ? 'DISABLE' : 'ENABLE',
    });
  };

  // Perform status confirmation
  const handleConfirmToggleStatus = async () => {
    if (!confirmModal.member) return;
    setIsTogglingStatus(true);
    const target = confirmModal.member;
    const nextStatus = !target.isActive;

    try {
      const updated = await toggleMemberStatus(target.id, nextStatus);
      setMembers((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      if (selectedMember && selectedMember.id === updated.id) {
        setSelectedMember(updated);
      }
      setConfirmModal({ isOpen: false, member: null, action: 'DISABLE' });
      showSuccessFeedback(
        nextStatus
          ? '¡La cuenta del Miembro ha sido habilitada exitosamente!'
          : '¡La cuenta del Miembro ha sido inhabilitada exitosamente!'
      );
    } catch {
      // Error handled quietly or modal closes
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const pageTitle =
    activeTab === 'PROJECTS'
      ? 'Gestión de Proyectos'
      : 'Gestión de Miembros';

  const sidebarItems: SidebarNavItem<TabType>[] = [
    {
      id: 'PROJECTS',
      label: 'Proyectos',
      icon: <FolderKanban className="w-4 h-4" />
    },
    {
      id: 'MEMBERS',
      label: 'Miembros',
      icon: <Users className="w-4 h-4" />,
    },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedMember(null);
    setIsCreatingMember(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <NavbarHeader
        user={user}
        organization={organization}
        pageTitle={pageTitle}
        onLogout={handleLogout}
      />

      {/* Main Content Area con Sidebar pegado a la izquierda y contenido centrado */}
      <main className="flex-1 w-full px-4 sm:px-6 py-6">
        {/* Global Feedback Banner */}
        {globalSuccess && (
          <div className="max-w-5xl mx-auto mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-3 shadow-xs animate-in fade-in">
            <svg
              className="w-5 h-5 text-emerald-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{globalSuccess}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-start w-full">
          {/* Side Navbar de Organización pegado a la izquierda */}
          <SidebarNav<TabType>
            items={sidebarItems}
            activeId={activeTab}
            onSelect={handleSelectTab}
            actionButton={
              activeTab === 'PROJECTS'
                ? {
                    label: 'Crear Proyecto',
                    icon: <Plus className="w-3.5 h-3.5 stroke-[2.5]" />,
                    onClick: () => {
                      setProjectCreateTrigger((prev) => prev + 1);
                    },
                  }
                : activeTab === 'MEMBERS'
                ? {
                    label: 'Nuevo Miembro',
                    icon: <Plus className="w-3.5 h-3.5 stroke-[2.5]" />,
                    onClick: () => {
                      setSelectedMember(null);
                      setIsCreatingMember(true);
                    },
                  }
                : undefined
            }
          />

          {/* Contenido centrado */}
          <div className="flex-1 w-full min-w-0 flex justify-center">
            <div className="w-full max-w-5xl space-y-6">
              {activeTab === 'PROJECTS' && organization && (
                <ProjectsPanel
                  organizationId={organization.id}
                  actor={user}
                  onSuccess={showSuccessFeedback}
                  createTrigger={projectCreateTrigger}
                />
              )}

              {/* Tab 2: Members Management (HU-003 & HU-004) */}
              {activeTab === 'MEMBERS' && (
                <div className="space-y-6">
                  {/* View 1: Member Detail View */}
                  {selectedMember ? (
                    <MemberDetail
                      member={selectedMember}
                      onUpdated={(updated) => {
                        setMembers((prev) =>
                          prev.map((m) => (m.id === updated.id ? updated : m))
                        );
                        setSelectedMember(updated);
                        showSuccessFeedback('¡Datos del miembro actualizados exitosamente!');
                      }}
                      onBack={() => setSelectedMember(null)}
                    />
                  ) : isCreatingMember ? (
                    /* View 2: Create Member Form */
                    <MemberForm
                      organizationId={organization?.id || ''}
                      onSuccess={() => {
                        loadMembers();
                        setIsCreatingMember(false);
                        showSuccessFeedback('¡Cuenta de Miembro creada exitosamente!');
                      }}
                      onCancel={() => setIsCreatingMember(false)}
                    />
                  ) : (
                    /* View 3: Member List View */
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Miembros de la Organización
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Gestiona las cuentas de los miembros del proyecto (Líderes y Desarrolladores).
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsCreatingMember(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          Nuevo Miembro
                        </button>
                      </div>

                      <MemberList
                        members={members}
                        isLoading={isLoadingMembers}
                        onSelectMember={(m) => setSelectedMember(m)}
                        onToggleStatus={(m) => handleOpenStatusModal(m)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Inhabilitar / Habilitar */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.action === 'DISABLE'
            ? 'Confirmar inhabilitación de cuenta'
            : 'Confirmar habilitación de cuenta'
        }
        message={
          confirmModal.action === 'DISABLE'
            ? `¿Estás seguro de que deseas inhabilitar la cuenta de ${confirmModal.member?.name}? El miembro no podrá iniciar sesión en el sistema.`
            : `¿Estás seguro de que deseas habilitar la cuenta de ${confirmModal.member?.name}? El miembro podrá volver a iniciar sesión.`
        }
        confirmText={
          confirmModal.action === 'DISABLE'
            ? 'Confirmar e Inhabilitar'
            : 'Confirmar y Habilitar'
        }
        isDangerous={confirmModal.action === 'DISABLE'}
        isLoading={isTogglingStatus}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() =>
          setConfirmModal({ isOpen: false, member: null, action: 'DISABLE' })
        }
      />
    </div>
  );
};
