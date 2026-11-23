import { DeveloperDashboard } from './DeveloperDashboard';
import { LeaderDashboard } from './LeaderDashboard';
import type { User, Organization } from '@/features/auth/types';

interface MemberDashboardProps {
  user: User;
  organization: Organization | null;
  onLogout: () => void;
}

export const MemberDashboard = ({ user, organization, onLogout }: MemberDashboardProps) => {
  if (user.role === 'LIDER') {
    return <LeaderDashboard user={user} organization={organization} onLogout={onLogout} />;
  }
  return <DeveloperDashboard user={user} organization={organization} onLogout={onLogout} />;
};

export { DeveloperDashboard, LeaderDashboard };
