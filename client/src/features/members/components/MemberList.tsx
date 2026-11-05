import { useState } from 'react';
import type { User } from '@/features/auth/types';

interface MemberListProps {
  members: User[];
  onSelectMember: (member: User) => void;
  onToggleStatus: (member: User) => void;
  isLoading?: boolean;
}

export const MemberList = ({
  members,
  onSelectMember,
  onToggleStatus,
  isLoading = false,
}: MemberListProps) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter((member) => {
    // Tab filter
    if (filter === 'ACTIVE' && !member.isActive) return false;
    if (filter === 'INACTIVE' && member.isActive) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = member.name.toLowerCase().includes(q);
      const matchEmail = member.email.toLowerCase().includes(q);
      const matchRole = member.role.toLowerCase().includes(q);
      return matchName || matchEmail || matchRole;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-xs">
      {/* Header bar with filters and search */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-md bg-gray-100 p-0.5">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filter === 'ALL'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todos ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filter === 'ACTIVE'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Habilitados ({members.filter((m) => m.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('INACTIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filter === 'INACTIVE'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inhabilitados ({members.filter((m) => !m.isActive).length})
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-2.5 top-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Members table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Miembro</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-xs text-gray-400">
                  Cargando miembros...
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-xs text-gray-400">
                  No se encontraron miembros en este criterio.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50/75 transition-colors"
                >
                  <td
                    onClick={() => onSelectMember(member)}
                    className="px-6 py-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block hover:text-red-600 transition-colors">
                          {member.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td
                    onClick={() => onSelectMember(member)}
                    className="px-6 py-4 cursor-pointer"
                  >
                    <span className="inline-block text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded">
                      {member.role === 'LIDER' ? 'Líder' : 'Desarrollador'}
                    </span>
                  </td>

                  <td
                    onClick={() => onSelectMember(member)}
                    className="px-6 py-4 cursor-pointer"
                  >
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        member.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {member.isActive ? 'Habilitado' : 'Inhabilitado'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectMember(member)}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Ver Detalle
                      </button>

                      {member.isActive ? (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(member)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Inhabilitar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(member)}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Habilitar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

