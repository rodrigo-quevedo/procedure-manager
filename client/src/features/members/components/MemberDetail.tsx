import { useState, type FormEvent } from 'react';
import { updateMember } from '../api/updateMember';
import type { User } from '@/features/auth/types';
import type { MemberRole } from '../types';

interface MemberDetailProps {
  member: User;
  onUpdated: (updatedMember: User) => void;
  onBack: () => void;
}

export const MemberDetail = ({
  member,
  onUpdated,
  onBack,
}: MemberDetailProps) => {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<MemberRole>(
    member.role === 'LIDER' ? 'LIDER' : 'DESARROLLADOR'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    if (!email.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }

    setIsLoading(true);

    try {
      const updated = await updateMember({
        id: member.id,
        name,
        email,
        password: password.trim() ? password : undefined,
        role,
      });

      setSuccessMessage('¡Datos del miembro actualizados exitosamente!');
      setPassword('');
      onUpdated(updated);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al actualizar el miembro.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors mb-2 cursor-pointer"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a la lista de miembros
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            Detalle del Miembro
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Edita los datos del miembro y presiona Guardar para aplicar los cambios.
          </p>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              member.isActive
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {member.isActive ? 'Habilitado' : 'Inhabilitado'}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">ID: {member.id}</p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-5 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
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
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
          <svg
            className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="editName"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
          >
            Nombre Completo
          </label>
          <input
            id="editName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="editEmail"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
          >
            Correo Electrónico
          </label>
          <input
            id="editEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="editRole"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
          >
            Rol
          </label>
          <select
            id="editRole"
            value={role}
            onChange={(e) => setRole(e.target.value as MemberRole)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors cursor-pointer"
          >
            <option value="DESARROLLADOR">Desarrollador</option>
            <option value="LIDER">Líder</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="editPassword"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
          >
            Nueva Contraseña (opcional)
          </label>
          <input
            id="editPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Dejar en blanco para conservar la actual"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Si deseas cambiar la contraseña, debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium text-sm rounded-md shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

