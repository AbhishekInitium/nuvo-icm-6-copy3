
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

// Mock client data lookup
const mockClients = {
  'ACME-001': 'ACME Corporation',
  'Globex-002': 'Globex Industries',
  'Initech-003': 'Initech Solutions',
  'Umbrella-004': 'Umbrella Enterprises',
  'Cyberdyne-005': 'Cyberdyne Systems'
};

export function Navbar() {
  const { user, logout } = useAuth();
  const clientName = user?.clientId ? (mockClients[user.clientId] || user.clientId) : 'Unknown Client';

  return (
    <nav style={{
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginRight: '32px'
          }}>
            <div style={{ 
              backgroundColor: '#004c97', 
              borderRadius: '50%', 
              width: '32px', 
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginRight: '12px'
            }}>
              📊
            </div>
            <div style={{ 
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              Nuvo ICM
              <span style={{ 
                fontSize: '12px',
                opacity: 0.7,
                marginLeft: '8px'
              }}>
                {clientName}
              </span>
            </div>
          </div>
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              {/* Navigation links based on role */}
              {user.role === "Manager" && (
                <>
                  <Link to="/schemes" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost">Schemes</Button>
                  </Link>
                  <Link to="/schemes/new" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost">Create Scheme</Button>
                  </Link>
                </>
              )}
              {user.role === "Admin" && (
                <>
                  <Link to="/kpi-configurator" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost">KPI Configurator</Button>
                  </Link>
                  <Link to="/kpi-configurations" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost">KPI Configurations</Button>
                  </Link>
                </>
              )}
              {user.role === "Agent" && (
                <Link to="/agent-dashboard" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
            </div>
          )}
        </div>
        
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ marginRight: '8px', fontSize: '14px' }}>
              <span style={{ color: '#64748b', marginRight: '4px' }}>Signed in as</span> 
              <span style={{ fontWeight: '500' }}>{user.username}</span>
              <span style={{ 
                marginLeft: '8px',
                backgroundColor: 'rgba(0, 76, 151, 0.1)',
                color: '#004c97',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {user.role}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <LogOut style={{ width: '16px', height: '16px' }} />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
