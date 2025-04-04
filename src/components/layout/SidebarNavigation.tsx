
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { 
  BarChart3, ListTodo, Calculator, Settings, 
  LogOut, Users, User, Database, Play, FileText 
} from 'lucide-react';

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export function SidebarNavigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    const items: NavigationItem[] = [];
    
    if (user?.role === 'Manager') {
      items.push(
        { icon: BarChart3, label: 'Dashboard', path: '/schemes' },
        { icon: ListTodo, label: 'Schemes', path: '/schemes' },
        { icon: Play, label: 'Scheme Run', path: '/scheme-run' },
        { icon: Calculator, label: 'Simulations', path: '/simulations' },
        { icon: FileText, label: 'Finance & Ops', path: '/finance-ops' }
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
    } else if (user?.role === 'Finance') {
      items.push(
        { icon: BarChart3, label: 'Dashboard', path: '/finance-ops' },
        { icon: FileText, label: 'Finance & Ops', path: '/finance-ops' },
        { icon: Play, label: 'Scheme Run', path: '/scheme-run' },
        { icon: Calculator, label: 'Reports', path: '/reports' }
      );
    }
    
    // Add Settings for all roles (for future use)
    items.push({ icon: Settings, label: 'Settings', path: '/settings' });
    
    return items;
  };
  
  const navigationItems = getNavigationItems();

  return (
    <SidebarMenu>
      {navigationItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton asChild>
            <Link 
              to={item.path} 
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                backgroundColor: isActive(item.path) ? 'rgba(0, 76, 151, 0.1)' : 'transparent',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                borderLeft: isActive(item.path) ? '3px solid #004c97' : '3px solid transparent',
                paddingLeft: isActive(item.path) ? '13px' : '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 16px'
              }}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
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
  );
}
