
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <div className="mr-8 font-bold text-xl">NUVO ICM Manager</div>
          {user && (
            <div className="flex items-center space-x-4">
              {/* Show links based on user role */}
              {user.role === "Manager" && (
                <>
                  <Link to="/schemes">
                    <Button variant="ghost">Schemes</Button>
                  </Link>
                  <Link to="/schemes/new">
                    <Button variant="ghost">Create Scheme</Button>
                  </Link>
                </>
              )}
              {user.role === "Admin" && (
                <>
                  <Link to="/kpi-configurator">
                    <Button variant="ghost">KPI Configurator</Button>
                  </Link>
                  <Link to="/kpi-configurations">
                    <Button variant="ghost">KPI Configurations</Button>
                  </Link>
                </>
              )}
              {user.role === "Agent" && (
                <Link to="/agent-dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
            </div>
          )}
        </div>
        
        {user && (
          <div className="flex items-center space-x-2">
            <div className="mr-2 text-sm">
              <span className="text-muted-foreground mr-1">Signed in as</span> 
              <span className="font-medium">{user.username}</span>
              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {user.role}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
