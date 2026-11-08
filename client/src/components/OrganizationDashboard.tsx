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

interface OrganizationDashboardProps {
  user: User;
  organization: Organization | null;
  onLogout: () => void;
}

type TabType = 'OVERVIEW' | 'MEMBERS' | 'PROJECTS';

export const OrganizationDashboard = ({
  user,
  organization,
  onLogout,
}: OrganizationDashboardProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('MEMBERS');
  const [members, setMembers] = useState<User[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isCreatingMember, setIsCreatingMember] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar - Todoist style */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
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
            <button
              type="button"
              onClick={() => {
                setActiveTab('MEMBERS');
                setSelectedMember(null);
                setIsCreatingMember(false);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'MEMBERS'
                  ? 'bg-red-50 text-red-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Gestión de Miembros
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('PROJECTS');
                setSelectedMember(null);
                setIsCreatingMember(false);
              }}
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
              onClick={() => {
                setActiveTab('OVERVIEW');
                setSelectedMember(null);
                setIsCreatingMember(false);
              }}
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
              {user.role}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Global Feedback Banner */}
        {globalSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-3 shadow-xs animate-in fade-in">
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

        {/* Tab 1: Overview */}
        {activeTab === 'OVERVIEW' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-xs">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Organization dashboard
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Bienvenido al panel de tu organización. Aquí podrás gestionar miembros, proyectos y procedimientos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-xs uppercase font-semibold text-gray-500">
                  Organización
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {organization?.name || 'N/A'}
                </p>
                <p className="text-xs text-gray-400 mt-1">ID: {organization?.id}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-xs uppercase font-semibold text-gray-500">
                  Usuario Activo
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">{user.name}</p>
                <p className="text-xs text-gray-400 mt-1">{user.email}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-xs uppercase font-semibold text-gray-500">
                  Total de Miembros
                </span>
                <p className="text-lg font-bold text-red-600 mt-1">{members.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {members.filter((m) => m.isActive).length} activos ·{' '}
                  {members.filter((m) => !m.isActive).length} inactivos
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PROJECTS' && organization && (
          <ProjectsPanel
            organizationId={organization.id}
            actor={user}
            onSuccess={showSuccessFeedback}
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
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
