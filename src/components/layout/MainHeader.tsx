
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MainHeaderProps {
  isMobile: boolean;
}

export function MainHeader({ isMobile }: MainHeaderProps) {
  const { user } = useAuth();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return '?';
    return user.username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>
      
      {/* Mobile-only user info */}
      {isMobile && user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            backgroundColor: 'rgba(0, 76, 151, 0.1)',
            color: '#004c97',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {user.role}
          </span>
          <Avatar style={{ width: '32px', height: '32px' }}>
            <AvatarFallback style={{ backgroundColor: '#004c97', color: 'white', fontSize: '0.75rem' }}>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}

