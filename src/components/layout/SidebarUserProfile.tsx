
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock client data lookup (would come from an API in production)
const mockClients = {
  'ACME-001': 'ACME Corporation',
  'Globex-002': 'Globex Industries',
  'Initech-003': 'Initech Solutions',
  'Umbrella-004': 'Umbrella Enterprises',
  'Cyberdyne-005': 'Cyberdyne Systems'
};

export function SidebarUserProfile() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const clientName = user.clientId ? (mockClients[user.clientId] || user.clientId) : 'Unknown Client';
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user.username) return '?';
    return user.username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-3" style={{ 
      padding: '8px',
      borderTop: '1px solid var(--sidebar-border)'
    }}>
      <Avatar>
        <AvatarFallback style={{ backgroundColor: '#004c97', color: 'white' }}>
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{user.username}</div>
        <div style={{ 
          fontSize: '0.75rem',
          color: 'var(--sidebar-foreground)',
          backgroundColor: 'rgba(0, 76, 151, 0.1)',
          padding: '2px 6px',
          borderRadius: '9999px',
          display: 'inline-block'
        }}>
          {user.role}
        </div>
      </div>
    </div>
  );
}
