import { storage } from '@/services/storage';
import type { Organization, User } from '@/features/auth/types';

interface MemberDashboardProps {
  user: User;
  organization: Organization | null;
  onLogout: () => void;
}

export const MemberDashboard = ({
  user,
  organization,
  onLogout,
}: MemberDashboardProps) => {
  const handleLogout = () => {
    storage.clearSession();
    onLogout();
  };

  const roleLabel =
    user.role === 'LIDER' ? 'Líder' : 'Desarrollador';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            PM
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">
            {organization?.name || 'Procedure Manager'}
          </span>
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

      {/* Main Content Area (placeholder) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-xs">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {roleLabel} dashboard
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Bienvenido, <span className="font-medium text-gray-700">{user.name}</span>.
            Desde aquí podrás acceder a los proyectos y procedimientos de la organización.
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
      </main>
    </div>
  );
};

