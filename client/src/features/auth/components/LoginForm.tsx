import { useState, type FormEvent } from 'react';
import { loginUser } from '../api/loginUser';
import type { AuthSession } from '../types';

interface LoginFormProps {
  onSuccess: (session: AuthSession) => void;
  onNavigateToRegister: () => void;
}

export const LoginForm = ({
  onSuccess,
  onNavigateToRegister,
}: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const session = await loginUser({ email, password });
      onSuccess(session);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al iniciar sesión.');
      }
    } finally {
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa a tu cuenta para acceder al sistema de procedimientos.
          </p>
        </div>

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
              htmlFor="loginEmail"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Correo Electrónico
            </label>
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="loginPassword"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Contraseña
            </label>
            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Iniciando sesión...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Navigation to Register */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-600">
          <span>¿No tienes una cuenta aún? </span>
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-colors"
          >
            Registrar Organización
          </button>
        </div>
      </div>
    </div>
  );
};

