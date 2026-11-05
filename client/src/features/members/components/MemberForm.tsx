import { useState, type FormEvent } from 'react';
import { createMember } from '../api/createMember';
import type { MemberRole } from '../types';

interface MemberFormProps {
  organizationId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const MemberForm = ({
  organizationId,
  onSuccess,
  onCancel,
}: MemberFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<MemberRole>('DESARROLLADOR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Front-end early validation for mandatory fields
    if (!name.trim()) {
      setError('Por favor, ingresa el nombre completo del miembro.');
      return;
    }

    if (!email.trim()) {
      setError('Por favor, ingresa un correo electrónico.');
      return;
    }

    if (!password) {
      setError('Por favor, ingresa una contraseña.');
      return;
    }

    if (!role) {
      setError('Por favor, selecciona un rol.');
      return;
    }

    setIsLoading(true);

    try {
      await createMember(organizationId, {
        name,
        email,
        password,
        role,
      });

      setSuccessMessage('¡Miembro registrado exitosamente!');
      setName('');
      setEmail('');
      setPassword('');
      setRole('DESARROLLADOR');
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al registrar el miembro.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Miembro</h3>
        <p className="text-xs text-gray-500 mt-1">
          Crea una cuenta para un Líder o Desarrollador para que pueda acceder a los proyectos.
        </p>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
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
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
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
            htmlFor="memberName"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
          >
            Nombre Completo
          </label>
          <input
            id="memberName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="memberEmail"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
          >
            Correo Electrónico
          </label>
          <input
            id="memberEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="miembro@empresa.com"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="memberPassword"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
          >
            Contraseña
          </label>
          <input
            id="memberPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Mínimo 8 caracteres, con al menos una mayúscula, una minúscula, un número y un carácter especial.
          </p>
        </div>

        <div>
          <label
            htmlFor="memberRole"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
          >
            Rol
          </label>
          <select
            id="memberRole"
            value={role}
            onChange={(e) => setRole(e.target.value as MemberRole)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors cursor-pointer"
          >
            <option value="DESARROLLADOR">Desarrollador</option>
            <option value="LIDER">Líder</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium text-sm rounded-md shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registrando...' : 'Registrar Miembro'}
          </button>
        </div>
      </form>
    </div>
  );
};

