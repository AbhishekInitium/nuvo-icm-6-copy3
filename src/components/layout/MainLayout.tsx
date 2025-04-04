
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { ChevronRight, BarChart3, ListTodo, Calculator, Settings, LogOut, Users, User, Database } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Mock client data lookup (would come from an API in production)
const mockClients = {
  'ACME-001': 'ACME Corporation',
  'Globex-002': 'Globex Industries',
  'Initech-003': 'Initech Solutions',
  'Umbrella-004': 'Umbrella Enterprises',
  'Cyberdyne-005': 'Cyberdyne Systems'
};

export function MainLayout() {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const clientName = user?.clientId ? (mockClients[user.clientId] || user.clientId) : 'Unknown Client';
  const location = useLocation();
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    const items = [];
    
    if (user?.role === 'Manager') {
      items.push(
        { icon: BarChart3, label: 'Dashboard', path: '/schemes' },
        { icon: ListTodo, label: 'Schemes', path: '/schemes' },
        { icon: Calculator, label: 'Simulations', path: '/simulations' }
      );
    } else if (user?.role === 'Admin') {
      items.push(
        { icon: BarChart3, label: 'Dashboard', path: '/kpi-configurator' },
        { icon: ListTodo, label: 'Configurator', path: '/kpi-configurator' },
        { icon: Users, label: 'KPI Configs', path: '/kpi-configurations' },
        { icon: Database, label: 'System Config', path: '/system-config' }
      );
    } else if (user?.role === 'Agent') {
      items.push(
        { icon: BarChart3, label: 'Dashboard', path: '/agent-dashboard' },
        { icon: User, label: 'My Performance', path: '/agent-dashboard' }
      );
    }
    
    // Add Settings for all roles (for future use)
    items.push({ icon: Settings, label: 'Settings', path: '/settings' });
    
    return items;
  };
  
  const navigationItems = getNavigationItems();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="group/sidebar-wrapper flex min-h-svh w-full">
        <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} variant="sidebar">
          <SidebarHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2">
              <div style={{ 
                backgroundColor: '#004c97', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                📊
              </div>
              <div>
                <div style={{ 
                  fontWeight: 'bold',
                  fontSize: '1.1rem' 
                }}>
                  Nuvo ICM
                </div>
                <div style={{ 
                  fontSize: '0.75rem',
                  opacity: 0.7
                }}>
                  {clientName}
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.path} 
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        backgroundColor: isActive(item.path) ? 'rgba(0, 76, 151, 0.1)' : 'transparent',
                        fontWeight: isActive(item.path) ? 'bold' : 'normal',
                        borderLeft: isActive(item.path) ? '3px solid #004c97' : '3px solid transparent',
                        paddingLeft: isActive(item.path) ? '13px' : '16px'
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4">
            {user && (
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
            )}
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                {user && (
                  <h1 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    Welcome, {user.username} ({clientName})
                  </h1>
                )}
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
            
            <main>
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
