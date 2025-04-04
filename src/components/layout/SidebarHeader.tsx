
import { useAuth } from '@/contexts/AuthContext';

// Mock client data lookup (would come from an API in production)
const mockClients = {
  'ACME-001': 'ACME Corporation',
  'Globex-002': 'Globex Industries',
  'Initech-003': 'Initech Solutions',
  'Umbrella-004': 'Umbrella Enterprises',
  'Cyberdyne-005': 'Cyberdyne Systems'
};

export function SidebarHeader() {
  const { user } = useAuth();
  const clientName = user?.clientId ? (mockClients[user.clientId] || user.clientId) : 'Unknown Client';

  return (
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
  );
}
