
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarUserProfile } from './SidebarUserProfile';
import { SidebarHeader as SidebarHeaderComponent } from './SidebarHeader';
import { MainHeader } from './MainHeader';

export function MainLayout() {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="group/sidebar-wrapper flex min-h-svh w-full">
        <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} variant="sidebar">
          <SidebarHeader className="flex items-center justify-between">
            <SidebarHeaderComponent />
          </SidebarHeader>

          <SidebarContent>
            <SidebarNavigation />
          </SidebarContent>

          <SidebarFooter className="p-4">
            {user && <SidebarUserProfile />}
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="p-4 md:p-6">
            <MainHeader isMobile={isMobile} />
            
            <main>
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
