import { useState, type FormEvent } from 'react';
import { registerOrganization } from '../api/registerOrganization';
import { validatePassword } from '../utils/validation';
import type { AuthSession } from '../types';

interface RegisterFormProps {
  onSuccess: (session: AuthSession) => void;
  onNavigateToLogin: () => void;
}

export const RegisterForm = ({
  onSuccess,
  onNavigateToLogin,
}: RegisterFormProps) => {
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Front-end early validation for empty fields
    if (!organizationName.trim()) {
      setError('Por favor, ingresa el nombre de la organización.');
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

    if (!confirmPassword) {
      setError('Por favor, confirma tu contraseña.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifica e inténtalo nuevamente.');
      return;
    }

    // Front-end early validation for password requirements
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      setError(passwordCheck.message || 'La contraseña no cumple con los requisitos.');
      return;
    }

    setIsLoading(true);

    try {
      const session = await registerOrganization({
        organizationName,
        email,
        password,
      });

      // Show success message without auto login
      setSuccessMessage('¡Cuenta de organización creada exitosamente!');
      // Reset form fields
      setOrganizationName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsLoading(false);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Registrar Organización
          </h2>
          <p className="text-sm text-gray-500 mt-3">
            Crea una cuenta para tu organización y comienza a gestionar proyectos y miembros.
          </p>
        </div>

        {/* Success message banner */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {successMessage}
              <br />
              Ya puedes
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-medium ml-1 text-red-600 hover:underline cursor-pointer transition-colors"
              >
                iniciar sesión.
              </button>
            </span>

          </div>
        )}

        {/* Error message banner */}
        {error && (
          <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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
              htmlFor="organizationName"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Nombre de la Organización
            </label>
            <input
              id="organizationName"
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Ej. Acme Corporation"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@organizacion.com"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1 leading-tight">
              Mínimo 8 caracteres, con al menos una mayúscula, una minúscula, un número y un carácter especial.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium text-sm rounded-md shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Registrando...
              </span>
            ) : (
              'Crear Organización'
            )}
          </button>
        </form>

        {/* Navigation to Login */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-600">
          <span>¿Ya tienes una cuenta? </span>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
