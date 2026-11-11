import { useState, useEffect } from 'react';
import { RegisterForm, LoginForm } from '@/features/auth';
import { ExampleComponent } from '@/examples/ExampleComponent';
import type { AuthSession, Organization, User } from '@/features/auth';
import { OrganizationDashboard } from '@/components/OrganizationDashboard';
import { MemberDashboard } from '@/components/MemberDashboard';
import { storage } from '@/services/storage';
import { DeviationView } from './examples/Deviation';
import { EvaluationView } from './examples/Evaluation';
import { ProcedureSearchAndFilter } from './examples/ProcedureFIlter';
import { ExecutionManagementMock } from './examples/ExecutionManagement';
import EvaluationManagement from './examples/EvaluationManagement';

type AuthView = 'register' | 'login';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentAuthView, setCurrentAuthView] = useState<AuthView>('register');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedUser = storage.getCurrentUser();
    const savedOrg = storage.getCurrentOrganization();

    if (savedUser) {
      setCurrentUser(savedUser);
      setCurrentOrganization(savedOrg);
    }
    setIsInitializing(false);
  }, []);

  const handleAuthSuccess = (session: AuthSession) => {
    setCurrentUser(session.user);
    setCurrentOrganization(session.organization);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentOrganization(null);
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
  if (currentUser) {
    if (currentUser.role === 'ORGANIZACION') {
      return (
        <OrganizationDashboard
          user={currentUser}
          organization={currentOrganization}
          onLogout={handleLogout}
        />
      );
    }

    // LIDER or DESARROLLADOR
    return (
      <MemberDashboard
        user={currentUser}
        organization={currentOrganization}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {currentAuthView === 'register' ? (
        <RegisterForm
          onSuccess={handleAuthSuccess}
          onNavigateToLogin={() => setCurrentAuthView('login')}
        />
      ) : (
        <LoginForm
          onSuccess={handleAuthSuccess}
          onNavigateToRegister={() => setCurrentAuthView('register')}
        />
      )}
    </div>
  );


}

export default App;
