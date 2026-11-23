import { useState, useEffect } from 'react';
import { RegisterForm, LoginForm } from '@/features/auth';
import type { AuthSession } from '@/features/auth';
import { OrganizationDashboard } from '@/components/dashboards/OrganizationDashboard';
import { DeveloperDashboard } from '@/components/dashboards/DeveloperDashboard';
import { LeaderDashboard } from '@/components/dashboards/LeaderDashboard';

type AuthView = 'register' | 'login';

const SESSION_KEY = 'pm_auth_session';

const loadSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    // Discard expired sessions
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

const saveSession = (session: AuthSession): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentAuthView, setCurrentAuthView] = useState<AuthView>('login');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const saved = loadSession();
    if (saved) setSession(saved);
    setIsInitializing(false);
  }, []);

  const handleAuthSuccess = (newSession: AuthSession) => {
    saveSession(newSession);
    setSession(newSession);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setCurrentAuthView('login');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Cargando...</div>
      </div>
    );
  }

  // Routing by role after authentication
  if (session) {
    const { user } = session;

    if (user.role === 'ORGANIZATION') {
      return (
        <OrganizationDashboard
          user={user as any}
          organization={null}
          onLogout={handleLogout}
        />
      );
    }

    if (user.role === 'LEADER') {
      return (
        <LeaderDashboard
          user={user as any}
          organization={null}
          onLogout={handleLogout}
        />
      );
    }

    // DEVELOPER
    return (
      <DeveloperDashboard
        user={user as any}
        organization={null}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      {currentAuthView === 'register' ? (
        <RegisterForm
          onSuccess={() => setCurrentAuthView('login')}
          onNavigateToLogin={() => setCurrentAuthView('login')}
        />
      ) : (
        <LoginForm
          onSuccess={handleAuthSuccess}
          onNavigateToRegister={() => setCurrentAuthView('register')}
        />
      )}
    </>
  );
}

export default App;
