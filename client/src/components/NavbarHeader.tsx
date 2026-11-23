import React from 'react';
import type { User, Organization } from '@/features/auth/types';
import logoImg from '@/assets/logo.png';

interface NavbarHeaderProps {
  user: User;
  organization: Organization | null;
  pageTitle?: string;
  onLogout: () => void;
  children?: React.ReactNode;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  user,
  organization,
  pageTitle,
  onLogout,
  children,
}) => {
  const roleLabel =
    user.role === 'LEADER'
      ? 'Líder'
      : user.role === 'ORGANIZATION'
        ? 'Organización'
        : 'Desarrollador';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Logo"
            className="w-9 h-9 object-contain shrink-0"
          />
          {pageTitle && (
            <div className="flex items-center gap-2">
              <span className="h-5 w-px bg-gray-200" />
              <span className="font-extrabold text-gray-700 text-lg tracking-normal">
                {pageTitle}
              </span>
            </div>
          )}
        </div>

        {children && (
          <nav className="flex flex-wrap items-center gap-1">
            {children}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Bloque de Identidad (2 líneas alineadas a la derecha) */}
        <div className="text-right flex flex-col items-end">
          <span className="text-sm font-medium text-zinc-900 leading-tight">
            {user.email}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
            {organization?.name && <span>{organization.name}</span>}
            {organization?.name && <span>·</span>}
            <span className="inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded border border-red-200 text-red-700 bg-red-50/50">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Separador vertical sutil */}
        <div className="h-6 w-px bg-zinc-200" />

        {/* Botón de salida */}
        <button
          onClick={onLogout}
          type="button"
          className="text-xs font-medium text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-md bg-white hover:bg-red-50 transition-colors cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};
